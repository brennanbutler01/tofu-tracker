import { useGamesSWR } from '@/services/games/useGamesSWR'
import { useSWRConfig } from 'swr'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import {
    CorrectStatus,
    GameAnswer,
    GameTypes,
    Prisma,
    QuestionType,
    Roles,
    Teams,
    User,
} from '@prisma/client'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { gameService } from '@/services/games/gameService'
import cuid from 'cuid'
import { GameWithFullOptions } from '@/pages/api/games/[id]'

export const GAME_URL = '/api/games'

interface ICreateGame {
    id: string
    questions: Array<QuestionWithOptions>
    title: string
}

interface ICreateGameAnswer {
    isCorrect: CorrectStatus
    questionId: string
    answer: string
}

export type CreateGameAnswerValues = ICreateGameAnswer & { type: QuestionType }

export type CreateGameSessionType = (props: ICreateGame) => Promise<void>

export const prepareGameAnswer = (
    val: CreateGameAnswerValues,
    user:
        | ({ role: Roles; userId: string; team: Teams } & {
              name?: string | null
              email?: string | null
              image?: string | null
          })
        | undefined,
    game: GameWithFullOptions
    // type?: "course" | "free" = "free"
) => {
    const answerHistory: Prisma.GameAnswerCreateWithoutGameSessionInput = {
        id: cuid(),
        created: new Date(),
        question: {
            connect: {
                id: val.questionId,
            },
        },
        player: {
            connect: {
                id: user?.userId,
            },
        },
        isCorrect: val.isCorrect,
        userAnswer: {
            connectOrCreate: {
                where: {
                    id:
                        game.questions[game.currentQuestion - 1].options.find(
                            opt => opt.answer === val.answer
                        )?.id || '-1',
                },
                create: {
                    id: cuid(),
                    answer: val.answer,
                    created: new Date(),
                    question: {
                        connect: {
                            id: val.questionId,
                        },
                    },
                },
            },
        },
    }

    const mutateQuestion = game?.questions?.find(q => q.id === val.questionId)

    const mutateAnswerHistory = () =>
        ({
            id: answerHistory.id,
            created: new Date(),
            updatedAt: new Date(),
            isCorrect: val.isCorrect,
            questionId: val.questionId,
            gameSessionId: game.id,
            answerOptionId:
                answerHistory?.userAnswer?.connectOrCreate?.where?.id ||
                answerHistory?.userAnswer?.create?.id,
            playerId: user?.userId,
            userAnswer: {
                ...answerHistory?.userAnswer?.connectOrCreate?.create,
                // question: mutateQuestion,
            },
            question: mutateQuestion,
            gradingSessionId: null,
            critiqueId: null,
        } as GameAnswer)

    const isGameComplete = game.currentQuestion - 1 === game.questions.length

    const updateGame: // Prisma.GameSessionUpdateInput |
    Prisma.GameSessionUpdateWithoutCourseSessionInput = {
        id: game.id,
        numberAnswered: {
            increment: 1,
        },
        numberCorrect: {
            increment: val.isCorrect === CorrectStatus.TRUE ? 1 : 0,
        },
        answerHistory: {
            create: answerHistory,
        },
        isComplete: isGameComplete,
        ...(isGameComplete && { completedAt: new Date() }),
    }

    const optimisticData = {
        ...game,
        numberAnswered: game.numberAnswered + 1,
        numberCorrect:
            game.numberCorrect + (val.isCorrect === CorrectStatus.TRUE ? 1 : 0),
        answerHistory: [...game.answerHistory, mutateAnswerHistory()],
    } as GameWithFullOptions

    return { optimisticData, updateGame }
}

export const useGameCRUD = () => {
    const { mutate } = useSWRConfig()
    const { data: session } = useSession()
    const {
        query: { id },
    } = useRouter()
    const game = useGamesSWR(id as string)

    const createGameSession = async ({ id, questions, title }: ICreateGame) => {
        try {
            const createGame: Prisma.GameSessionCreateInput = {
                id,
                questions: {
                    connect: questions.map(q => ({ id: q.id })),
                },
                user: {
                    connect: {
                        id: session?.user?.userId,
                    },
                },
                title,
                type: GameTypes.FREE,
            }

            await mutate(
                GAME_URL,
                gameService.createGameSession(createGame).then(res => {
                    messageConfig({
                        operation: CRUDOperation.CREATE,
                        status: MessageStatus.SUCCESS,
                        model: Models.GAME,
                    })
                    return res.data
                }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        id,
                        questions,
                        userId: session?.user?.userId,
                    } as GameWithFullOptions,
                }
            )
        } catch (err) {
            messageConfig({
                operation: CRUDOperation.CREATE,
                status: MessageStatus.ERROR,
                model: Models.GAME,
            })
            console.log(`Error fetching`)
        }
    }

    const createGameAnswer = async (val: CreateGameAnswerValues) => {
        if (session?.user) {
            try {
                const { optimisticData, updateGame } = prepareGameAnswer(
                    val,
                    session?.user,
                    game
                )
                await mutate(
                    `${GAME_URL}/${id}`,
                    gameService.updateGameSession(updateGame).then(res => {
                        messageConfig({
                            operation: CRUDOperation.UPDATE,
                            status: MessageStatus.SUCCESS,
                            model: Models.GAME,
                        })
                        return res.data
                    }),
                    {
                        rollbackOnError: true,
                        optimisticData,
                    }
                )
            } catch (err) {
                messageConfig({
                    status: MessageStatus.ERROR,
                    operation: CRUDOperation.UPDATE,
                    model: Models.GAME,
                })
                console.log('Error trying to submit answer', err)
            }
        }
    }

    const advanceGameQuestion = async () => {
        const isComplete = game.currentQuestion === game.questions.length
        try {
            await mutate(
                `${GAME_URL}/${game.id}`,
                gameService
                    .updateGameSession({
                        id: game.id,
                        currentQuestion: {
                            increment: length ? 0 : 1,
                        },
                        isComplete: isComplete,
                        completedAt: isComplete ? new Date() : null,
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.GAME,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...game,
                        currentQuestion: game.currentQuestion + 1,
                        isComplete,
                        completedAt: isComplete ? new Date() : null,
                    },
                }
            )
        } catch (err) {
            console.log(
                `Error trying to advance the game questions. Error: ${err}`
            )
            messageConfig({
                operation: CRUDOperation.UPDATE,
                status: MessageStatus.ERROR,
                model: Models.GAME,
            })
        }
    }

    return { createGameAnswer, createGameSession, advanceGameQuestion }
}
