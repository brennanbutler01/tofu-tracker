import prisma from '@/prisma/prisma'
import { GameTypes } from '@prisma/client'
import { z } from 'zod'
import { identifier, RequestError } from './apiHandler'
import { applyGameAction, GameAction } from './gameSessions'
import {
    fullActivitySessions,
    fullCourseSession,
    orderActivitySession,
    orderCourseSession,
} from './sessionShapes'
export const createActivitySessionSchema = z
    .object({ activityId: identifier })
    .strict()
export const createCourseSessionSchema = z
    .object({ courseId: identifier })
    .strict()
export async function getActivitySession(id: string, userId: string) {
    const record = await prisma.activitySession.findFirst({
        where: { id, userId },
        ...fullActivitySessions,
    })
    return record ? orderActivitySession(record) : null
}
export async function getCourseSession(id: string, userId: string) {
    const record = await prisma.courseSession.findFirst({
        where: { id, userId },
        ...fullCourseSession,
    })
    return record ? orderCourseSession(record) : null
}
export async function createActivitySession(
    activityId: string,
    userId: string
) {
    return prisma.$transaction(async tx => {
        const activity = await tx.activity.findUnique({
            where: { id: activityId },
            include: {
                questions: {
                    where: { archived: false },
                    orderBy: [{ created: 'asc' }, { id: 'asc' }],
                },
            },
        })
        if (!activity) throw new RequestError(404, 'Activity not found')
        const available = new Set(activity.questions.map(q => q.id))
        const ids = [
            ...new Set([
                ...activity.questionOrder.filter(id => available.has(id)),
                ...available,
            ]),
        ]
        if (!ids.length || ids.length > 100)
            throw new RequestError(
                409,
                'Activity must contain between 1 and 100 questions'
            )
        return orderActivitySession(
            await tx.activitySession.create({
                data: {
                    user: { connect: { id: userId } },
                    activity: { connect: { id: activityId } },
                    gameSession: {
                        create: {
                            userId,
                            type: GameTypes.ACTIVITY,
                            title: activity.title,
                            questionOrder: ids,
                            questions: { connect: ids.map(id => ({ id })) },
                        },
                    },
                },
                ...fullActivitySessions,
            })
        )
    })
}
export async function createCourseSession(courseId: string, userId: string) {
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`
        const course = await tx.course.findUnique({
            where: { id: courseId },
            include: {
                decks: {
                    where: { archived: false },
                    orderBy: [{ created: 'asc' }, { id: 'asc' }],
                    include: {
                        questions: {
                            where: { archived: false },
                            orderBy: [{ created: 'asc' }, { id: 'asc' }],
                        },
                    },
                },
            },
        })
        if (!course) throw new RequestError(404, 'Course not found')
        if (course.preReqs.length) {
            const passed = await tx.courseSession.findMany({
                where: {
                    userId,
                    passed: true,
                    courseId: { in: course.preReqs },
                },
                select: { courseId: true },
            })
            if (
                new Set(passed.map(s => s.courseId)).size !==
                new Set(course.preReqs).size
            )
                throw new RequestError(
                    409,
                    'Complete the prerequisite courses first'
                )
        }
        const ids = [
            ...new Set(
                course.decks.flatMap(deck => deck.questions.map(q => q.id))
            ),
        ]
        if (!ids.length || ids.length > 100)
            throw new RequestError(
                409,
                'Course must contain between 1 and 100 questions'
            )
        const attempt =
            (await tx.courseSession.count({ where: { userId, courseId } })) + 1
        return orderCourseSession(
            await tx.courseSession.create({
                data: {
                    user: { connect: { id: userId } },
                    course: { connect: { id: courseId } },
                    attempt,
                    gameSession: {
                        create: {
                            userId,
                            type: GameTypes.COURSE,
                            title: course.title,
                            questionOrder: ids,
                            questions: { connect: ids.map(id => ({ id })) },
                        },
                    },
                },
                ...fullCourseSession,
            })
        )
    })
}
export async function updateActivitySession(
    id: string,
    userId: string,
    action: GameAction
) {
    return prisma.$transaction(async tx => {
        const session = await tx.activitySession.findFirst({
            where: { id, userId },
        })
        if (!session) throw new RequestError(404, 'Activity session not found')
        await applyGameAction(tx, session.gameSessionId, userId, action)
        return orderActivitySession(
            await tx.activitySession.findUniqueOrThrow({
                where: { id },
                ...fullActivitySessions,
            })
        )
    })
}
export async function updateCourseSession(
    id: string,
    userId: string,
    action: GameAction
) {
    return prisma.$transaction(async tx => {
        const session = await tx.courseSession.findFirst({
            where: { id, userId },
        })
        if (!session) throw new RequestError(404, 'Course session not found')
        await applyGameAction(tx, session.gameSessionId, userId, action)
        return orderCourseSession(
            await tx.courseSession.findUniqueOrThrow({
                where: { id },
                ...fullCourseSession,
            })
        )
    })
}
