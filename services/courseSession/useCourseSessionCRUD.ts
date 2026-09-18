import { CorrectStatus, GameTypes, Prisma, Question } from '@prisma/client'
import cuid from 'cuid'
import { useSession } from 'next-auth/react'
import { useCourseSessionSWR } from '@/services/courseSession/useCourseSessionSWR'
import { printError } from '@/utils/printError.utils'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { useSWRConfig } from 'swr'
import { courseSessionService } from '@/services/courseSession/courseSessionService'
import { useCoursesSWR } from '../courses/useCoursesSWR'
import { CreateGameAnswerValues } from '@/services/games/useGameCRUD'
import { useSingularCourseSessionSWR } from '@/services/courseSession/useSingularCourseSessionSWR'
import { useRouter } from 'next/router'
import GameAnswerCreateWithoutGameSessionInput = Prisma.GameAnswerCreateWithoutGameSessionInput

export const COURSE_SESSION_API = `/api/courseSession`

interface ICreateCourseSession {
    courseId: string
}

export const useCourseSessionCRUD = () => {
    const { data } = useSession()
    const courseSessions = useCourseSessionSWR({})
    const courses = useCoursesSWR({})
    const { mutate } = useSWRConfig()
    const { query } = useRouter()
    const ourCourseSession = useSingularCourseSessionSWR({
        id: query.id as string,
    })

    const createCourseSession = async ({ courseId }: ICreateCourseSession) => {
        const numberOfAttempts =
            courseSessions?.filter(
                session =>
                    session.courseId === courseId &&
                    session?.userId === data?.user?.userId
            )?.length || 0
        const course = courses.find(c => c.id === courseId)

        const questions =
            course?.decks?.reduce<Question[]>((acc, curr) => {
                return [...acc, ...curr?.questions]
            }, []) || []

        const newCourseSession: Prisma.CourseSessionCreateInput = {
            id: cuid(),
            created: new Date(),
            course: {
                connect: {
                    id: courseId,
                },
            },
            updatedAt: new Date(),
            user: {
                connect: {
                    id: data?.user?.userId,
                },
            },
            attempt: numberOfAttempts + 1,
            gameSession: {
                create: {
                    id: cuid(),
                    user: {
                        connect: {
                            id: data?.user?.userId,
                        },
                    },
                    type: GameTypes.COURSE,
                    updatedAt: new Date(),
                    started: new Date(),
                    currentQuestion: 1,
                    numberCorrect: 0,
                    numberAnswered: 0,
                    isComplete: false,
                    title: '',
                    questions: {
                        connect: questions.map(({ id }) => ({ id })),
                    },
                },
            },
        }

        try {
            await mutate(
                COURSE_SESSION_API,
                courseSessionService
                    .createCourseSession(newCourseSession)
                    .then(res => {
                        messageConfig({
                            model: Models.COURSE_SESSION,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.CREATE,
                        })
                        return [...courseSessions, res.data]
                    })
            )
            return newCourseSession.id
        } catch (err) {
            await printError({
                operation: CRUDOperation.CREATE,
                err,
                model: Models.COURSE_SESSION,
            })
        }
    }

    const gradeCourseAnswer = async (val: CreateGameAnswerValues) => {
        try {
            const gameSession = ourCourseSession?.gameSession

            const newAnswerHistory = {
                id: cuid(),
                created: new Date(),
                isCorrect: val.isCorrect,
                userAnswer: gameSession?.questions[
                    gameSession?.currentQuestion - 1
                ]?.options.find(opt => opt.answer === val.answer),
                updatedAt: new Date(),
                question: gameSession?.questions?.find(
                    q => q.id === val.questionId
                ),
                player: data?.user,
            }
            const optimisticData = {
                ...ourCourseSession,
                updatedAt: new Date(),
                gameSession: {
                    ...ourCourseSession?.gameSession,
                    updatedAt: new Date(),
                    numberCorrect:
                        gameSession?.numberCorrect +
                        (val.isCorrect === CorrectStatus.TRUE ? 1 : 0),
                    numberAnswered: gameSession?.numberAnswered + 1,
                    answerHistory: [
                        ...gameSession?.answerHistory,
                        newAnswerHistory,
                    ],
                },
            }

            await mutate(
                `${COURSE_SESSION_API}/${ourCourseSession?.id}`,
                courseSessionService
                    .updateCourseSession({
                        id: ourCourseSession?.id,
                        updatedAt: new Date(),
                        gameSession: {
                            update: {
                                id: ourCourseSession?.gameSessionId,
                                updatedAt: new Date(),
                                numberCorrect: {
                                    increment:
                                        val.isCorrect === CorrectStatus.TRUE
                                            ? 1
                                            : 0,
                                },
                                numberAnswered: {
                                    increment: 1,
                                },
                                answerHistory: {
                                    create: {
                                        id: newAnswerHistory?.id,
                                        created: new Date(),
                                        isCorrect: val.isCorrect,
                                        userAnswer: {
                                            connect: {
                                                id: gameSession?.questions[
                                                    gameSession?.currentQuestion -
                                                        1
                                                ]?.options.find(
                                                    opt =>
                                                        opt.answer ===
                                                        val.answer
                                                )?.id,
                                            },
                                        },
                                        updatedAt: new Date(),
                                        question: {
                                            connect: {
                                                id: val.questionId,
                                            },
                                        },
                                        player: {
                                            connect: {
                                                id: data?.user
                                                    ?.userId as string,
                                            },
                                        },
                                    } as GameAnswerCreateWithoutGameSessionInput,
                                },
                            },
                        },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.COURSE_SESSION,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData,
                }
            )
        } catch (err) {
            await printError({
                err,
                operation: CRUDOperation.UPDATE,
                model: Models.COURSE_SESSION,
            })
        }
    }

    const advanceCourseQuestion = async () => {
        const isComplete =
            ourCourseSession?.gameSession?.currentQuestion ===
            ourCourseSession?.gameSession?.questions?.length
        const userPercentage =
            (ourCourseSession?.gameSession?.numberCorrect /
                ourCourseSession?.gameSession?.numberAnswered) *
            100
        const passed =
            isComplete &&
            userPercentage >= ourCourseSession?.course?.percentToPass

        try {
            const updateCourseGameSession = {
                id: ourCourseSession?.gameSessionId,
                isComplete: isComplete,
                completedAt: isComplete ? new Date() : null,
                currentQuestion:
                    ourCourseSession?.gameSession?.currentQuestion +
                    (length ? 0 : 1),
            }
            const optimisticData = {
                ...ourCourseSession,
                isComplete,
                gameSession: {
                    ...ourCourseSession?.gameSession,
                    ...updateCourseGameSession,
                },
                passed,
            }
            await mutate(
                `${COURSE_SESSION_API}/${ourCourseSession?.id}`,
                courseSessionService
                    .updateCourseSession({
                        id: ourCourseSession?.id,
                        isComplete,
                        passed,
                        gameSession: { update: updateCourseGameSession },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.COURSE_SESSION,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData,
                }
            )
        } catch (err) {
            await printError({
                model: Models.COURSE_SESSION,
                err,
                operation: CRUDOperation.UPDATE,
            })
        }
    }
    return { createCourseSession, gradeCourseAnswer, advanceCourseQuestion }
}
