import prisma from '@/prisma/prisma'
import { Prisma, Roles } from '@prisma/client'
import { z } from 'zod'
import { identifier, RequestError } from './apiHandler'
import { fullQuestionFeedback } from './feedbackShapes'
import type { Viewer } from './userHandlers'
const comment = z.string().trim().min(1).max(4000)
const resourceFields = {
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(4000),
    location: z
        .string()
        .url()
        .max(2000)
        .refine(value => {
            const url = new URL(value)
            return url.protocol === 'https:' && !url.username && !url.password
        }),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
}
export const feedbackActionSchema = z.discriminatedUnion('action', [
    z.object({ action: z.literal('initialize') }).strict(),
    z
        .object({
            action: z.literal('comment'),
            comment,
            parentId: identifier.optional(),
            resourceId: identifier.optional(),
        })
        .strict(),
    z
        .object({
            action: z.literal('rate'),
            rating: z.number().min(0).max(5).multipleOf(0.5),
        })
        .strict(),
    z.object({ action: z.literal('resource'), ...resourceFields }).strict(),
    z
        .object({
            action: z.literal('editResource'),
            resourceId: identifier,
            ...resourceFields,
        })
        .strict(),
    z
        .object({
            action: z.literal('react'),
            target: z.enum(['comment', 'resourceComment', 'resource']),
            targetId: identifier,
            reaction: z.enum(['like', 'dislike', 'none']),
        })
        .strict(),
])
export type FeedbackAction = z.infer<typeof feedbackActionSchema>
async function requireQuestion(
    tx: Prisma.TransactionClient,
    questionId: string,
    viewer: Viewer
) {
    const question = await tx.question.findFirst({
        where: {
            id: questionId,
            ...(viewer.role === Roles.ADMIN
                ? {}
                : { GameSession: { some: { userId: viewer.userId } } }),
        },
        select: { id: true },
    })
    if (!question) throw new RequestError(404, 'Question not found')
}
export async function getQuestionFeedback(questionId: string, viewer: Viewer) {
    await requireQuestion(prisma, questionId, viewer)
    return prisma.questionFeedback.findUnique({
        where: { questionId },
        ...fullQuestionFeedback,
    })
}
export async function updateQuestionFeedback(
    questionId: string,
    viewer: Viewer,
    input: FeedbackAction
) {
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "Question" WHERE id = ${questionId} FOR UPDATE`
        await requireQuestion(tx, questionId, viewer)
        const feedback = await tx.questionFeedback.upsert({
            where: { questionId },
            create: { questionId },
            update: {},
        })
        const userId = viewer.userId
        if (input.action === 'comment') {
            if (input.resourceId) {
                const resource = await tx.questionResources.findFirst({
                    where: { id: input.resourceId, feedbackId: feedback.id },
                })
                if (!resource) throw new RequestError(404, 'Resource not found')
                if (
                    (await tx.resourceComments.count({
                        where: { resourceId: resource.id },
                    })) >= 100
                )
                    throw new RequestError(409, 'Comment limit reached')
                if (
                    input.parentId &&
                    !(await tx.resourceComments.findFirst({
                        where: {
                            id: input.parentId,
                            resourceId: resource.id,
                        },
                    }))
                )
                    throw new RequestError(404, 'Parent comment not found')
                const created = await tx.resourceComments.create({
                    data: {
                        resourceId: resource.id,
                        userId,
                        comment: input.comment,
                        parentComment: input.parentId,
                        likes: [],
                        dislikes: [],
                        childrenComments: [],
                    },
                })
                if (input.parentId)
                    await tx.resourceComments.update({
                        where: { id: input.parentId },
                        data: { childrenComments: { push: created.id } },
                    })
            } else {
                if (
                    (await tx.questionComments.count({
                        where: { questionFeedbackId: feedback.id },
                    })) >= 100
                )
                    throw new RequestError(409, 'Comment limit reached')
                if (
                    input.parentId &&
                    !(await tx.questionComments.findFirst({
                        where: {
                            id: input.parentId,
                            questionFeedbackId: feedback.id,
                        },
                    }))
                )
                    throw new RequestError(404, 'Parent comment not found')
                const created = await tx.questionComments.create({
                    data: {
                        questionFeedbackId: feedback.id,
                        userId,
                        comment: input.comment,
                        parentComment: input.parentId,
                        likes: [],
                        dislikes: [],
                        childrenComments: [],
                    },
                })
                if (input.parentId)
                    await tx.questionComments.update({
                        where: { id: input.parentId },
                        data: { childrenComments: { push: created.id } },
                    })
            }
        } else if (input.action === 'rate') {
            const existing = await tx.questionRating.findFirst({
                where: { questionFeedbackId: feedback.id, userId },
                orderBy: { id: 'asc' },
            })
            if (existing) {
                await tx.questionRating.update({
                    where: { id: existing.id },
                    data: { rating: input.rating },
                })
                await tx.questionRating.deleteMany({
                    where: {
                        questionFeedbackId: feedback.id,
                        userId,
                        id: { not: existing.id },
                    },
                })
            } else
                await tx.questionRating.create({
                    data: {
                        questionFeedbackId: feedback.id,
                        userId,
                        rating: input.rating,
                    },
                })
        } else if (input.action === 'resource') {
            if (
                (await tx.questionResources.count({
                    where: { feedbackId: feedback.id },
                })) >= 50
            )
                throw new RequestError(409, 'Resource limit reached')
            const { action, ...fields } = input
            await tx.questionResources.create({
                data: {
                    ...fields,
                    feedbackId: feedback.id,
                    userId,
                    likes: [],
                    dislikes: [],
                },
            })
        } else if (input.action === 'editResource') {
            const resource = await tx.questionResources.findFirst({
                where: {
                    id: input.resourceId,
                    feedbackId: feedback.id,
                    userId,
                },
            })
            if (!resource) throw new RequestError(404, 'Resource not found')
            const { action, resourceId, ...fields } = input
            await tx.questionResources.update({
                where: { id: resourceId },
                data: { ...fields, updatedAt: new Date() },
            })
        } else if (input.action === 'react') {
            const record =
                input.target === 'comment'
                    ? await tx.questionComments.findFirst({
                          where: {
                              id: input.targetId,
                              questionFeedbackId: feedback.id,
                          },
                      })
                    : input.target === 'resourceComment'
                    ? await tx.resourceComments.findFirst({
                          where: {
                              id: input.targetId,
                              resource: { feedbackId: feedback.id },
                          },
                      })
                    : await tx.questionResources.findFirst({
                          where: {
                              id: input.targetId,
                              feedbackId: feedback.id,
                          },
                      })
            if (!record) throw new RequestError(404, 'Feedback item not found')
            const data = {
                likes: [
                    ...record.likes.filter(id => id !== userId),
                    ...(input.reaction === 'like' ? [userId] : []),
                ],
                dislikes: [
                    ...record.dislikes.filter(id => id !== userId),
                    ...(input.reaction === 'dislike' ? [userId] : []),
                ],
            }
            if (input.target === 'comment')
                await tx.questionComments.update({
                    where: { id: record.id },
                    data,
                })
            else if (input.target === 'resourceComment')
                await tx.resourceComments.update({
                    where: { id: record.id },
                    data,
                })
            else
                await tx.questionResources.update({
                    where: { id: record.id },
                    data,
                })
        }
        return tx.questionFeedback.findUniqueOrThrow({
            where: { id: feedback.id },
            ...fullQuestionFeedback,
        })
    })
}
