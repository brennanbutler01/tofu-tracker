import { refreshAssessmentResults } from './assessmentResults'
import prisma from '@/prisma/prisma'
import { CorrectStatus, GameTypes, Prisma, QuestionType } from '@prisma/client'
import { z } from 'zod'
import { answersMatch } from '@/utils/answersMatch'
import { identifier, RequestError } from './apiHandler'
import { gameWithQuestionsOptions, orderGameQuestions } from './gameShapes'

export const createFreeGameSchema = z
    .object({
        id: identifier.optional(),
        title: z.string().trim().min(1).max(200),
        questionIds: z.array(identifier).min(1).max(100),
    })
    .strict()
export const gameActionSchema = z.discriminatedUnion('action', [
    z
        .object({
            action: z.literal('answer'),
            questionId: identifier,
            answer: z.string().trim().min(1).max(8000),
        })
        .strict(),
    z.object({ action: z.literal('advance') }).strict(),
])
export type GameAction = z.infer<typeof gameActionSchema>
export async function getOwnedGame(id: string, userId: string) {
    const game = await prisma.gameSession.findFirst({
        where: { id, userId },
        ...gameWithQuestionsOptions,
    })
    return game ? orderGameQuestions(game) : null
}
export async function createFreeGame(
    userId: string,
    input: z.infer<typeof createFreeGameSchema>
) {
    const ids = [...new Set(input.questionIds)]
    const questions = await prisma.question.findMany({
        where: { id: { in: ids }, archived: false },
    })
    if (questions.length !== ids.length)
        throw new RequestError(404, 'One or more questions are unavailable')
    return orderGameQuestions(
        await prisma.gameSession.create({
            data: {
                id: input.id,
                title: input.title,
                userId,
                type: GameTypes.FREE,
                questionOrder: ids,
                questions: { connect: ids.map(id => ({ id })) },
            },
            ...gameWithQuestionsOptions,
        })
    )
}
export async function applyGameAction(
    tx: Prisma.TransactionClient,
    id: string,
    userId: string,
    action: GameAction
) {
    // Serialize answer and advance commands so concurrent retries cannot double-count.
    await tx.$queryRaw`SELECT id FROM "GameSession" WHERE id = ${id} AND "userId" = ${userId} FOR UPDATE`
    const record = await tx.gameSession.findFirst({
        where: { id, userId },
        ...gameWithQuestionsOptions,
    })
    if (!record) throw new RequestError(404, 'Game not found')
    const game = orderGameQuestions(record)
    if (game.isComplete)
        throw new RequestError(409, 'This game is already complete')
    const current = game.questions[game.currentQuestion - 1]
    if (!current)
        throw new RequestError(409, 'This game has no current question')
    const existing = game.answerHistory.find(
        answer => answer.questionId === current.id
    )
    if (action.action === 'advance') {
        if (!existing)
            throw new RequestError(
                409,
                'Answer this question before continuing'
            )
        const complete = game.currentQuestion >= game.questions.length
        const updated = await tx.gameSession.update({
            where: { id },
            data: {
                currentQuestion: complete
                    ? game.currentQuestion
                    : game.currentQuestion + 1,
                isComplete: complete,
                completedAt: complete ? new Date() : null,
            },
            ...gameWithQuestionsOptions,
        })
        if (complete) await refreshAssessmentResults(tx, id)
        return orderGameQuestions(updated)
    }
    if (action.questionId !== current.id)
        throw new RequestError(409, 'The question is no longer current')
    if (existing)
        throw new RequestError(409, 'This question has already been answered')
    const option = current.options.find(
        option => option.answer === action.answer
    )
    if (current.type === QuestionType.MULTIPLE_CHOICE && !option)
        throw new RequestError(400, 'Choose an available answer')
    if (
        current.type === QuestionType.TRUE_FALSE &&
        !['true', 'false'].includes(action.answer.toLowerCase())
    )
        throw new RequestError(400, 'Choose true or false')
    const isCorrect =
        current.type === QuestionType.FREE_RESPONSE
            ? CorrectStatus.NEEDS_GRADED
            : answersMatch({
                  answer: action.answer,
                  expected: current.correctAnswer,
              })
            ? CorrectStatus.TRUE
            : CorrectStatus.FALSE
    return orderGameQuestions(
        await tx.gameSession.update({
            where: { id },
            data: {
                numberAnswered: { increment: 1 },
                numberCorrect: {
                    increment: isCorrect === CorrectStatus.TRUE ? 1 : 0,
                },
                answerHistory: {
                    create: {
                        player: { connect: { id: userId } },
                        question: { connect: { id: current.id } },
                        isCorrect,
                        userAnswer: option
                            ? { connect: { id: option.id } }
                            : { create: { answer: action.answer } },
                    },
                },
            },
            ...gameWithQuestionsOptions,
        })
    )
}
export async function updateOwnedGame(
    id: string,
    userId: string,
    action: GameAction
) {
    return prisma.$transaction(tx => applyGameAction(tx, id, userId, action))
}
