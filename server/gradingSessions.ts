import prisma from '@/prisma/prisma'
import { CorrectStatus, Prisma, Roles } from '@prisma/client'
import { z } from 'zod'
import { identifier, RequestError } from './apiHandler'
import type { Viewer } from './userHandlers'
import { answersToGrade, fullGradingSession } from './gradingShapes'
import { refreshAssessmentResults } from './assessmentResults'

export function requireReviewer(viewer: Viewer) {
    if (viewer.role !== Roles.ADMIN)
        throw new RequestError(403, 'Reviewer access required')
}
export const createGradingSchema = z
    .object({ answerIds: z.array(identifier).min(1).max(50) })
    .strict()
export const gradingActionSchema = z.discriminatedUnion('action', [
    z
        .object({
            action: z.literal('grade'),
            answerId: identifier,
            isCorrect: z.enum([CorrectStatus.TRUE, CorrectStatus.FALSE]),
        })
        .strict(),
    z
        .object({
            action: z.literal('critique'),
            answerId: identifier,
            text: z.string().trim().min(1).max(8000),
        })
        .strict(),
    z
        .object({
            action: z.literal('resource'),
            answerId: identifier,
            title: z.string().trim().min(1).max(200),
            location: z
                .string()
                .url()
                .max(2000)
                .refine(
                    value =>
                        new URL(value).protocol === 'https:' &&
                        !new URL(value).username &&
                        !new URL(value).password
                ),
            description: z.string().trim().max(4000).default(''),
            tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
        })
        .strict(),
    z.object({ action: z.literal('advance') }).strict(),
])
export type GradingAction = z.infer<typeof gradingActionSchema>
export function getGradingSession(id: string, userId: string) {
    return prisma.gradingSession.findFirst({
        where: { id, gradedById: userId },
        ...fullGradingSession,
    })
}
export function getGradingSessions(userId: string) {
    return prisma.gradingSession.findMany({
        where: { gradedById: userId },
        orderBy: [{ isComplete: 'asc' }, { created: 'desc' }],
        take: 100,
        ...fullGradingSession,
    })
}
export function getAnswersToGrade(cursor?: string) {
    return prisma.gameAnswer.findMany({
        where: {
            isCorrect: CorrectStatus.NEEDS_GRADED,
            gradingSessionId: null,
            ...(cursor ? { id: { gt: cursor } } : {}),
        },
        take: 50,
        orderBy: { id: 'asc' },
        ...answersToGrade,
    })
}
export async function createGradingSession(
    userId: string,
    answerIds: string[]
) {
    const ids = [...new Set(answerIds)].sort()
    return prisma.$transaction(async tx => {
        // Lock in a stable order before claiming work, including simultaneous reviewers.
        await tx.$queryRaw(
            Prisma.sql`SELECT id FROM "GameAnswer" WHERE id IN (${Prisma.join(
                ids
            )}) ORDER BY id FOR UPDATE`
        )
        const answers = await tx.gameAnswer.findMany({
            where: {
                id: { in: ids },
                isCorrect: CorrectStatus.NEEDS_GRADED,
                gradingSessionId: null,
            },
        })
        if (answers.length !== ids.length)
            throw new RequestError(
                409,
                'One or more answers are no longer available for review'
            )
        return tx.gradingSession.create({
            data: {
                gradedById: userId,
                currentAnswer: ids[0],
                answersToGrade: { connect: ids.map(id => ({ id })) },
            },
            ...fullGradingSession,
        })
    })
}
export async function updateGradingSession(
    id: string,
    userId: string,
    action: GradingAction
) {
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "GradingSession" WHERE id = ${id} AND "gradedById" = ${userId} FOR UPDATE`
        const session = await tx.gradingSession.findFirst({
            where: { id, gradedById: userId },
            ...fullGradingSession,
        })
        if (!session) throw new RequestError(404, 'Review session not found')
        if (session.isComplete)
            throw new RequestError(409, 'This review is already complete')
        const current = session.answersToGrade.find(
            answer => answer.id === session.currentAnswer
        )
        if (!current)
            throw new RequestError(
                409,
                'This review no longer has a current answer'
            )
        if (action.action === 'advance') {
            if (current.isCorrect === CorrectStatus.NEEDS_GRADED)
                throw new RequestError(
                    409,
                    'Grade this answer before continuing'
                )
            const next = session.answersToGrade.find(
                answer => answer.isCorrect === CorrectStatus.NEEDS_GRADED
            )
            await tx.gradingSession.update({
                where: { id },
                data: {
                    currentAnswer: next?.id ?? current.id,
                    isComplete: !next,
                },
            })
        } else {
            if (action.answerId !== current.id)
                throw new RequestError(409, 'The answer is no longer current')
            if (action.action === 'grade') {
                if (!current.gameSessionId)
                    throw new RequestError(
                        409,
                        'The learning session is unavailable'
                    )
                const gameId = current.gameSessionId
                await tx.$queryRaw`SELECT id FROM "GameSession" WHERE id = ${gameId} FOR UPDATE`
                await tx.gameAnswer.update({
                    where: { id: current.id },
                    data: {
                        isCorrect: action.isCorrect,
                        updatedAt: new Date(),
                    },
                })
                await refreshAssessmentResults(tx, gameId)
            } else if (action.action === 'critique') {
                if (!current.answerOptionId)
                    throw new RequestError(
                        409,
                        'This answer has no written response'
                    )
                if (current.critiqueId) {
                    await tx.gradingCritique.update({
                        where: { id: current.critiqueId },
                        data: { critique: action.text },
                    })
                } else {
                    await tx.gameAnswer.update({
                        where: { id: current.id },
                        data: {
                            critique: {
                                create: {
                                    critique: action.text,
                                    gradedById: userId,
                                    userAnswerId: current.answerOptionId,
                                },
                            },
                        },
                    })
                }
            } else {
                if (!current.critiqueId)
                    throw new RequestError(
                        409,
                        'Add feedback before a resource'
                    )
                if ((current.critique?.resources.length ?? 0) >= 20)
                    throw new RequestError(
                        409,
                        'This review already has twenty resources'
                    )
                await tx.critiqueResource.create({
                    data: {
                        critiqueId: current.critiqueId,
                        title: action.title,
                        location: action.location,
                        description: action.description,
                        tags: action.tags,
                    },
                })
            }
        }
        return tx.gradingSession.findUniqueOrThrow({
            where: { id },
            ...fullGradingSession,
        })
    })
}
