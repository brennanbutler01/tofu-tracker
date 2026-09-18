import prisma from '@/prisma/prisma'
import { Prisma, QuestionType, SimpleResponseInputTypes } from '@prisma/client'
import { z } from 'zod'
import { identifier, RequestError } from './apiHandler'

const title = z.string().trim().min(3).max(200)
const tags = z.array(z.string().trim().min(1).max(50)).max(20)
export const createDeckSchema = z
    .object({ title, tags: tags.default([]) })
    .strict()
export const editDeckSchema = z
    .object({ title: title.optional(), tags: tags.optional() })
    .strict()
    .refine(value => Object.keys(value).length > 0)
const questionFields = z
    .object({
        question: z.string().trim().min(5).max(4000),
        type: z.nativeEnum(QuestionType),
        correctAnswer: z.string().trim().min(1).max(8000),
        explanation: z.string().trim().max(8000).nullable().default(null),
        simpleResponseType: z
            .nativeEnum(SimpleResponseInputTypes)
            .nullable()
            .default(null),
        options: z
            .array(z.string().trim().min(1).max(2000))
            .max(20)
            .default([]),
    })
    .strict()
export const questionSchema = questionFields
    .superRefine((value, ctx) => {
        const choice = value.type === QuestionType.MULTIPLE_CHOICE
        if (
            choice &&
            (value.options.length < 2 ||
                !value.options.includes(value.correctAnswer))
        )
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Provide at least two choices and select a correct answer from them',
            })
        if (new Set(value.options).size !== value.options.length)
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Answer choices must be unique',
            })
        if (
            value.type === QuestionType.TRUE_FALSE &&
            !['true', 'false'].includes(value.correctAnswer)
        )
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'The answer must be true or false',
            })
        if (
            value.type === QuestionType.SIMPLE_RESPONSE &&
            !value.simpleResponseType
        )
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Choose a response format',
            })
    })
    .transform(value => ({
        ...value,
        options:
            value.type === QuestionType.TRUE_FALSE
                ? ['true', 'false']
                : value.type === QuestionType.MULTIPLE_CHOICE
                ? value.options
                : [],
        simpleResponseType:
            value.type === QuestionType.SIMPLE_RESPONSE
                ? value.simpleResponseType
                : null,
    }))
export type QuestionValues = z.input<typeof questionSchema>
export const deckQuestionActionSchema = z.discriminatedUnion('action', [
    z
        .object({ action: z.literal('create'), question: questionSchema })
        .strict(),
    z
        .object({
            action: z.literal('edit'),
            questionId: identifier,
            changes: questionFields
                .partial()
                .strict()
                .refine(value => Object.keys(value).length > 0),
        })
        .strict(),
    z
        .object({
            action: z.literal('addOptions'),
            questionId: identifier,
            options: z.array(z.string().trim().min(1).max(2000)).min(1).max(20),
        })
        .strict(),
    z
        .object({
            action: z.literal('removeOptions'),
            questionId: identifier,
            optionIds: z.array(identifier).min(1).max(20),
        })
        .strict(),
])
export type DeckQuestionAction = z.input<typeof deckQuestionActionSchema>
export const deckQuestionsShape = Prisma.validator<Prisma.DeckDefaultArgs>()({
    include: {
        questions: {
            where: { archived: false },
            orderBy: [{ created: 'asc' }, { id: 'asc' }],
            include: {
                options: { orderBy: [{ created: 'asc' }, { id: 'asc' }] },
            },
        },
    },
})
export const decksWithQuestionCount =
    Prisma.validator<Prisma.DeckDefaultArgs>()({
        include: {
            _count: { select: { questions: { where: { archived: false } } } },
            questions: { where: { archived: false } },
        },
    })
export function getDeckQuestionCount() {
    return prisma.deck.findMany({
        where: { archived: false },
        take: 100,
        orderBy: { created: 'desc' },
        ...decksWithQuestionCount,
    })
}
export function getDeckQuestions(id: string) {
    return prisma.deck.findFirst({
        where: { id, archived: false },
        ...deckQuestionsShape,
    })
}
export function getDecksWithQuestionOptions() {
    return prisma.deck.findMany({
        where: { archived: false },
        take: 100,
        orderBy: { created: 'asc' },
        ...deckQuestionsShape,
    })
}
export async function requireActiveDeck(
    tx: Prisma.TransactionClient,
    id: string
) {
    await tx.$queryRaw`SELECT id FROM "Deck" WHERE id = ${id} FOR UPDATE`
    const deck = await tx.deck.findFirst({ where: { id, archived: false } })
    if (!deck) throw new RequestError(404, 'Deck not found')
    return deck
}
export async function createDeck(
    userId: string,
    input: z.infer<typeof createDeckSchema>
) {
    return prisma.deck.create({
        data: { ...input, userId },
        ...deckQuestionsShape,
    })
}
export async function editDeck(
    id: string,
    input: z.infer<typeof editDeckSchema>
) {
    return prisma.$transaction(async tx => {
        await requireActiveDeck(tx, id)
        return tx.deck.update({
            where: { id },
            data: input,
            ...deckQuestionsShape,
        })
    })
}
export async function archiveDeck(id: string) {
    return prisma.$transaction(async tx => {
        await requireActiveDeck(tx, id)
        // Preserve content referenced by existing games instead of deleting history.
        await tx.question.updateMany({
            where: { deckId: id },
            data: { archived: true },
        })
        return tx.deck.update({ where: { id }, data: { archived: true } })
    })
}
export async function archiveDeckQuestion(deckId: string, questionId: string) {
    return prisma.$transaction(async tx => {
        await requireActiveDeck(tx, deckId)
        const question = await tx.question.findFirst({
            where: { id: questionId, deckId, archived: false },
        })
        if (!question)
            throw new RequestError(404, 'Question not found in this deck')
        await tx.question.update({
            where: { id: questionId },
            data: { archived: true },
        })
        return tx.deck.findUniqueOrThrow({
            where: { id: deckId },
            ...deckQuestionsShape,
        })
    })
}
export async function updateDeckQuestion(
    deckId: string,
    action: z.infer<typeof deckQuestionActionSchema>
) {
    return prisma.$transaction(async tx => {
        await requireActiveDeck(tx, deckId)
        if (action.action === 'create') {
            if (
                (await tx.question.count({
                    where: { deckId, archived: false },
                })) >= 100
            )
                throw new RequestError(
                    409,
                    'A deck can contain up to 100 active questions'
                )
            const { options, ...fields } = action.question
            await tx.question.create({
                data: {
                    ...fields,
                    deckId,
                    options: { create: options.map(answer => ({ answer })) },
                },
            })
        } else {
            const original = await tx.question.findFirst({
                where: { id: action.questionId, deckId, archived: false },
                include: { options: true },
            })
            if (!original)
                throw new RequestError(404, 'Question not found in this deck')
            const fields = {
                question: original.question,
                type: original.type,
                correctAnswer: original.correctAnswer,
                explanation: original.explanation,
                simpleResponseType: original.simpleResponseType,
                options: original.options.map(option => option.answer),
            }
            if (action.action === 'edit') Object.assign(fields, action.changes)
            else {
                if (original.type !== QuestionType.MULTIPLE_CHOICE)
                    throw new RequestError(
                        400,
                        'Only multiple-choice questions have editable options'
                    )
                if (action.action === 'addOptions')
                    fields.options.push(...action.options)
                else {
                    if (
                        action.optionIds.some(
                            id =>
                                !original.options.some(
                                    option => option.id === id
                                )
                        )
                    )
                        throw new RequestError(
                            404,
                            'Option not found in this question'
                        )
                    fields.options = original.options
                        .filter(option => !action.optionIds.includes(option.id))
                        .map(option => option.answer)
                }
            }
            const { options, ...validated } = questionSchema.parse(fields)
            // Each edit creates an immutable version. In-progress and completed games keep their original content and answer options.
            const revised = await tx.question.create({
                data: {
                    ...validated,
                    deckId,
                    activityId: original.activityId,
                    options: { create: options.map(answer => ({ answer })) },
                },
            })
            await tx.question.update({
                where: { id: original.id },
                data: { archived: true },
            })
            if (original.activityId) {
                const activityId = original.activityId
                await tx.$queryRaw`SELECT id FROM "Activity" WHERE id = ${activityId} FOR UPDATE`
                const activity = await tx.activity.findUniqueOrThrow({
                    where: { id: activityId },
                })
                await tx.activity.update({
                    where: { id: activityId },
                    data: {
                        questionOrder: activity.questionOrder.map(id =>
                            id === original.id ? revised.id : id
                        ),
                    },
                })
            }
        }
        return tx.deck.findUniqueOrThrow({
            where: { id: deckId },
            ...deckQuestionsShape,
        })
    })
}
