import {
    visitorOwnerScope,
    visitorDeckScope,
    visitorQuestionScope,
} from './visitorScope'
import prisma from '@/prisma/prisma'
import { CourseLevel, Prisma } from '@prisma/client'
import { z } from 'zod'
import { identifier, RequestError } from './apiHandler'
const title = z.string().trim().min(3).max(200)
const description = z.string().trim().min(1).max(8000)
const percentage = z.number().int().min(1).max(100)
const ids = z
    .array(identifier)
    .max(100)
    .refine(
        values => new Set(values).size === values.length,
        'Selections must be unique'
    )
const courseFields = z
    .object({
        title,
        description,
        percentToPass: percentage,
        level: z.nativeEnum(CourseLevel),
        preReqs: ids,
        deckIds: ids,
    })
    .strict()
export const createCourseSchema = courseFields
export const editCourseSchema = courseFields
    .partial()
    .strict()
    .refine(value => Object.keys(value).length > 0)
export type CourseInput = z.infer<typeof createCourseSchema>
const activityFields = z
    .object({
        title,
        description,
        percentToPass: percentage,
        displayOnMain: z.boolean(),
        questionIds: ids,
    })
    .strict()
export const createActivitySchema = activityFields
export const editActivitySchema = activityFields
    .partial()
    .strict()
    .refine(value => Object.keys(value).length > 0)
export type ActivityInput = z.infer<typeof createActivitySchema>
const trackFields = z.object({ title, description, courseIds: ids }).strict()
export const createTrackSchema = trackFields
export const editTrackSchema = trackFields
    .partial()
    .strict()
    .refine(value => Object.keys(value).length > 0)
export type TrackInput = z.infer<typeof createTrackSchema>
export const coursesWithDecks = Prisma.validator<Prisma.CourseDefaultArgs>()({
    include: {
        decks: {
            where: { archived: false },
            include: { questions: { where: { archived: false } } },
        },
    },
})
export const activityWithQuestions =
    Prisma.validator<Prisma.ActivityDefaultArgs>()({
        include: {
            questions: {
                where: { archived: false },
                orderBy: [{ created: 'asc' }, { id: 'asc' }],
            },
        },
    })
export const learningTrackWithOrderedCourses =
    Prisma.validator<Prisma.LearningTrackDefaultArgs>()({
        include: {
            courseOrder: {
                where: { course: { archived: false } },
                include: { course: true },
                orderBy: { index: 'asc' },
            },
        },
    })
export function getCourses(userId: string) {
    return prisma.course.findMany({
        where: { archived: false, ...visitorOwnerScope(userId) },
        take: 100,
        orderBy: { created: 'asc' },
        ...coursesWithDecks,
    })
}
export function getCourse(id: string, userId: string) {
    return prisma.course.findFirst({
        where: { id, archived: false, ...visitorOwnerScope(userId) },
        ...coursesWithDecks,
    })
}
export function getActivities(userId: string) {
    return prisma.activity.findMany({
        where: { archived: false, ...visitorOwnerScope(userId) },
        take: 100,
        orderBy: { created: 'asc' },
        ...activityWithQuestions,
    })
}
export function getActivity(id: string, userId: string) {
    return prisma.activity.findFirst({
        where: { id, archived: false, ...visitorOwnerScope(userId) },
        ...activityWithQuestions,
    })
}
export function getLearningTracks(userId: string) {
    return prisma.learningTrack.findMany({
        where: { archived: false, ...visitorOwnerScope(userId) },
        take: 100,
        orderBy: { created: 'asc' },
        ...learningTrackWithOrderedCourses,
    })
}
export function findOneTrack(id: string, userId: string) {
    return prisma.learningTrack.findFirst({
        where: { id, archived: false, ...visitorOwnerScope(userId) },
        ...learningTrackWithOrderedCourses,
    })
}
async function lockCurriculum(tx: Prisma.TransactionClient) {
    // Course graph and track membership changes share a lock to prevent cycles and archive races.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('tracker-curriculum-authoring'))`
}
async function validateCourseSelection(
    tx: Prisma.TransactionClient,
    courseIds: string[],
    userId: string
) {
    if (
        (await tx.course.count({
            where: {
                id: { in: courseIds },
                archived: false,
                ...visitorOwnerScope(userId),
            },
        })) !== courseIds.length
    )
        throw new RequestError(404, 'One or more courses are unavailable')
}
async function validateCourse(
    tx: Prisma.TransactionClient,
    id: string | undefined,
    preReqs: string[],
    deckIds: string[],
    userId: string
) {
    await validateCourseSelection(tx, preReqs, userId)
    if (
        (await tx.deck.count({
            where: {
                id: { in: deckIds },
                archived: false,
                ...visitorDeckScope(userId),
            },
        })) !== deckIds.length
    )
        throw new RequestError(404, 'One or more decks are unavailable')
    if (!id) return
    const courses = await tx.course.findMany({
        where: { archived: false, ...visitorOwnerScope(userId) },
        select: { id: true, preReqs: true },
    })
    const graph = new Map(courses.map(course => [course.id, course.preReqs]))
    const visited = new Set<string>()
    const pending = [...preReqs]
    while (pending.length) {
        const next = pending.pop()
        if (!next || visited.has(next)) continue
        if (next === id)
            throw new RequestError(409, 'Prerequisites cannot form a cycle')
        visited.add(next)
        pending.push(...(graph.get(next) ?? []))
    }
}
export async function createCourse(userId: string, input: CourseInput) {
    return prisma.$transaction(async tx => {
        await lockCurriculum(tx)
        const { deckIds, ...fields } = input
        await validateCourse(tx, undefined, fields.preReqs, deckIds, userId)
        return tx.course.create({
            data: {
                ...fields,
                ownerId: userId,
                decks: { connect: deckIds.map(id => ({ id })) },
            },
            ...coursesWithDecks,
        })
    })
}
export async function editCourse(
    id: string,
    input: z.infer<typeof editCourseSchema>,
    userId: string
) {
    return prisma.$transaction(async tx => {
        await lockCurriculum(tx)
        const current = await tx.course.findFirst({
            where: { id, archived: false, ...visitorOwnerScope(userId) },
            ...coursesWithDecks,
        })
        if (!current) throw new RequestError(404, 'Course not found')
        const { deckIds, ...fields } = input
        await validateCourse(
            tx,
            id,
            fields.preReqs ?? current.preReqs,
            deckIds ?? current.decks.map(deck => deck.id),
            userId
        )
        return tx.course.update({
            where: { id },
            data: {
                ...fields,
                updatedAt: new Date(),
                ...(deckIds
                    ? { decks: { set: deckIds.map(id => ({ id })) } }
                    : {}),
            },
            ...coursesWithDecks,
        })
    })
}
export async function archiveCourse(id: string, userId: string) {
    return prisma.$transaction(async tx => {
        await lockCurriculum(tx)
        const current = await tx.course.findFirst({
            where: { id, archived: false, ...visitorOwnerScope(userId) },
        })
        if (!current) throw new RequestError(404, 'Course not found')
        if (
            await tx.course.count({
                where: {
                    archived: false,
                    preReqs: { has: id },
                    ...visitorOwnerScope(userId),
                },
            })
        )
            throw new RequestError(
                409,
                'Remove this prerequisite from other courses before archiving it'
            )
        await tx.courseOrder.deleteMany({ where: { courseId: id } })
        return tx.course.update({
            where: { id },
            data: { archived: true, updatedAt: new Date() },
            ...coursesWithDecks,
        })
    })
}
async function setActivityQuestions(
    tx: Prisma.TransactionClient,
    activityId: string,
    questionIds: string[],
    userId: string
) {
    const sources = await tx.question.findMany({
        where: {
            id: { in: questionIds },
            archived: false,
            AND: [
                visitorQuestionScope(userId),
                { OR: [{ deckId: null }, { deck: { archived: false } }] },
                {
                    OR: [
                        { activityId: null },
                        { Activity: { archived: false } },
                    ],
                },
            ],
        },
        include: { options: true },
    })
    if (sources.length !== questionIds.length)
        throw new RequestError(404, 'One or more questions are unavailable')
    const ordered: string[] = []
    for (const id of questionIds) {
        const source = sources.find(question => question.id === id)
        if (!source) throw new RequestError(404, 'Question not found')
        if (source.activityId === activityId && source.deckId === null) {
            ordered.push(source.id)
            continue
        }
        // Copy content instead of moving the source question out of its deck or another activity.
        const copy = await tx.question.create({
            data: {
                question: source.question,
                type: source.type,
                correctAnswer: source.correctAnswer,
                explanation: source.explanation,
                simpleResponseType: source.simpleResponseType,
                activityId,
                options: {
                    create: source.options.map(option => ({
                        answer: option.answer,
                    })),
                },
            },
        })
        ordered.push(copy.id)
    }
    await tx.question.updateMany({
        where: { activityId, deckId: null, id: { notIn: ordered } },
        data: { archived: true },
    })
    // Detach legacy shared questions without removing them from their original decks.
    await tx.question.updateMany({
        where: { activityId, deckId: { not: null } },
        data: { activityId: null },
    })
    await tx.activity.update({
        where: { id: activityId },
        data: { questionOrder: ordered },
    })
}
export async function createActivity(userId: string, input: ActivityInput) {
    return prisma.$transaction(
        async tx => {
            const { questionIds, ...fields } = input
            const activity = await tx.activity.create({
                data: { ...fields, ownerId: userId, questionOrder: [] },
            })
            await setActivityQuestions(tx, activity.id, questionIds, userId)
            return tx.activity.findUniqueOrThrow({
                where: { id: activity.id },
                ...activityWithQuestions,
            })
        },
        { timeout: 15000 }
    )
}
export async function editActivity(
    id: string,
    input: z.infer<typeof editActivitySchema>,
    userId: string
) {
    return prisma.$transaction(
        async tx => {
            await tx.$queryRaw`SELECT id FROM "Activity" WHERE id = ${id} FOR UPDATE`
            if (
                !(await tx.activity.findFirst({
                    where: {
                        id,
                        archived: false,
                        ...visitorOwnerScope(userId),
                    },
                }))
            )
                throw new RequestError(404, 'Activity not found')
            const { questionIds, ...fields } = input
            await tx.activity.update({
                where: { id },
                data: { ...fields, updatedAt: new Date() },
            })
            if (questionIds)
                await setActivityQuestions(tx, id, questionIds, userId)
            return tx.activity.findUniqueOrThrow({
                where: { id },
                ...activityWithQuestions,
            })
        },
        { timeout: 15000 }
    )
}
export async function archiveActivity(id: string, userId: string) {
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "Activity" WHERE id = ${id} FOR UPDATE`
        if (
            !(await tx.activity.findFirst({
                where: { id, archived: false, ...visitorOwnerScope(userId) },
            }))
        )
            throw new RequestError(404, 'Activity not found')
        await tx.question.updateMany({
            where: { activityId: id, deckId: null },
            data: { archived: true },
        })
        return tx.activity.update({
            where: { id },
            data: { archived: true, updatedAt: new Date() },
            ...activityWithQuestions,
        })
    })
}
export async function createTrack(userId: string, input: TrackInput) {
    return prisma.$transaction(async tx => {
        await lockCurriculum(tx)
        const { courseIds, ...fields } = input
        await validateCourseSelection(tx, courseIds, userId)
        return tx.learningTrack.create({
            data: {
                ...fields,
                ownerId: userId,
                courses: { connect: courseIds.map(id => ({ id })) },
                courseOrder: {
                    create: courseIds.map((courseId, index) => ({
                        courseId,
                        index,
                    })),
                },
            },
            ...learningTrackWithOrderedCourses,
        })
    })
}
export async function editTrack(
    id: string,
    input: z.infer<typeof editTrackSchema>,
    userId: string
) {
    return prisma.$transaction(async tx => {
        await lockCurriculum(tx)
        if (
            !(await tx.learningTrack.findFirst({
                where: { id, archived: false, ...visitorOwnerScope(userId) },
            }))
        )
            throw new RequestError(404, 'Learning track not found')
        const { courseIds, ...fields } = input
        if (courseIds) {
            await validateCourseSelection(tx, courseIds, userId)
            await tx.courseOrder.deleteMany({ where: { learningTrackId: id } })
        }
        return tx.learningTrack.update({
            where: { id },
            data: {
                ...fields,
                ...(courseIds
                    ? {
                          courses: { set: courseIds.map(id => ({ id })) },
                          courseOrder: {
                              create: courseIds.map((courseId, index) => ({
                                  courseId,
                                  index,
                              })),
                          },
                      }
                    : {}),
            },
            ...learningTrackWithOrderedCourses,
        })
    })
}
export async function archiveTrack(id: string, userId: string) {
    return prisma.$transaction(async tx => {
        await lockCurriculum(tx)
        if (
            !(await tx.learningTrack.findFirst({
                where: { id, archived: false, ...visitorOwnerScope(userId) },
            }))
        )
            throw new RequestError(404, 'Learning track not found')
        return tx.learningTrack.update({
            where: { id },
            data: { archived: true },
            ...learningTrackWithOrderedCourses,
        })
    })
}
