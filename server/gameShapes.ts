import { Prisma } from '@prisma/client'
export const gameWithQuestionsOptions =
    Prisma.validator<Prisma.GameSessionDefaultArgs>()({
        include: {
            questions: {
                include: { options: true },
                orderBy: [{ created: 'asc' }, { id: 'asc' }],
            },
            answerHistory: {
                include: {
                    question: { include: { options: true } },
                    userAnswer: true,
                },
                orderBy: [{ created: 'asc' }, { id: 'asc' }],
            },
        },
    })
export type GameWithFullOptions = Prisma.GameSessionGetPayload<
    typeof gameWithQuestionsOptions
>
export const gameAnswerWithQuestionAnswer =
    Prisma.validator<Prisma.GameAnswerDefaultArgs>()({
        include: { question: { include: { options: true } }, userAnswer: true },
    })
export type GameAnswerWithQuestionAnswer = Prisma.GameAnswerGetPayload<
    typeof gameAnswerWithQuestionAnswer
>
export function orderGameQuestions(
    game: GameWithFullOptions
): GameWithFullOptions {
    const order = new Map(game.questionOrder.map((id, index) => [id, index]))
    return {
        ...game,
        questions: [...game.questions].sort(
            (left, right) =>
                (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
                (order.get(right.id) ?? Number.MAX_SAFE_INTEGER)
        ),
    }
}
