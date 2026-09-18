import { FullActivitySession } from '@/pages/api/activitySession'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { printError } from '@/utils/printError.utils'
import { CorrectStatus, GameTypes, Prisma } from '@prisma/client'
import cuid from 'cuid'
import { useSession } from 'next-auth/react'
import { useSWRConfig } from 'swr'
import { ACTIVITY_URL } from '../activities/useActivityCRUD'
import { useActivitySWR } from '../activities/useActivitySWR'
import { CreateGameAnswerValues, prepareGameAnswer } from '../games/useGameCRUD'
import { useQuestionSWR } from '../questions/useQuestionSWR'
import activitySessionService from './activitySessionService'
import { useActivitySessionSWR } from './useActivitySessionSWR'
import { useSingleActivitySessionSWR } from './useSingleActivitySessionSWR'

export const ACTIVITY_SESSION_URL = '/api/activitySession'

interface ICreateSession {
    activityId: string
}

interface IActivityCreateGameAnswer extends CreateGameAnswerValues {}

export const useActivitySessionCRUD = () => {
    const { mutate } = useSWRConfig()
    const session = useSession()
    const activities = useActivitySWR({})
    const activitySessions = useActivitySessionSWR({})
    const { data: activitySession } = useSingleActivitySessionSWR({})
    const questions = useQuestionSWR()

    const createActivitySession = async ({ activityId }: ICreateSession) => {
        console.log('this is our session', session)
        if (session?.status === 'authenticated') {
            try {
                const activity = activities.find(a => a.id === activityId)
                const questions = activity?.questions
                const now = new Date()
                const newGameSession = {
                    id: cuid(),
                    title: activity?.title || 'New Activity',
                }

                const newSession: Partial<Prisma.ActivitySessionCreateInput> = {
                    id: cuid(),
                    created: now,
                    updatedAt: now,
                    isComplete: false,
                    passed: false,
                }

                const user = {
                    user: { connect: { id: session?.data?.user?.userId } },
                }

                const prismaNewSession: Prisma.ActivitySessionCreateInput = {
                    ...newSession,
                    ...user,
                    activity: {
                        connect: {
                            id: activityId,
                        },
                    },
                    gameSession: {
                        create: {
                            ...newGameSession,
                            ...user,
                            questions: {
                                connect: questions?.map(q => ({
                                    id: q.id,
                                })),
                            },
                            type: GameTypes.ACTIVITY,
                        },
                    },
                }

                const mutatedActivitySessions = [
                    ...(activitySessions || []),
                    {
                        ...newSession,
                        user: session?.data?.user,
                        userId: session?.data?.user?.userId,
                        activity,
                        activityId,
                        gameSessionId: newGameSession?.id,
                        gameSession: {
                            ...newGameSession,
                            user: session?.data?.user,
                            userId: session?.data?.user?.userId,
                            questions: questions,
                        },
                    },
                ]

                await mutate(
                    ACTIVITY_SESSION_URL,
                    activitySessionService
                        .createActivitySession(prismaNewSession)
                        .then(res => {
                            messageConfig({
                                model: Models.ACTIVITY_SESSION,
                                operation: CRUDOperation.CREATE,
                                status: MessageStatus.SUCCESS,
                            })
                            return mutatedActivitySessions
                        }),
                    {
                        rollbackOnError: true,
                        optimisticData: mutatedActivitySessions,
                    }
                )

                return newSession.id
            } catch (err) {
                await printError({
                    err,
                    model: Models.ACTIVITY_SESSION,
                    operation: CRUDOperation.CREATE,
                })
            }
        }
    }

    const gradeActivityAnswer = async (val: IActivityCreateGameAnswer) => {
        console.log('session', session)
        if (session?.data?.user?.userId) {
            const { optimisticData, updateGame } = prepareGameAnswer(
                {
                    answer: val.answer,
                    isCorrect: val.isCorrect,
                    questionId: val.questionId,
                    type: val.type,
                },
                session?.data?.user,
                activitySession?.gameSession
            )
            try {
                await mutate(
                    `${ACTIVITY_SESSION_URL}/${activitySession?.id}`,
                    activitySessionService
                        .updateActivitySession({
                            id: activitySession?.id,
                            gameSession: {
                                update: updateGame,
                            },
                        })
                        .then(res => {
                            messageConfig({
                                model: Models.ACTIVITY_SESSION,
                                operation: CRUDOperation.UPDATE,
                                status: MessageStatus.SUCCESS,
                            })
                            return res.data
                        }),
                    {
                        rollbackOnError: true,
                        optimisticData: {
                            ...activitySession,
                            gameSession: optimisticData,
                        },
                    }
                )
            } catch (err) {
                await printError({
                    err,
                    model: Models.ACTIVITY_SESSION,
                    operation: CRUDOperation.UPDATE,
                })
            }
        }
    }

    console.log('activitySession', activitySession)

    const advanceActivityGameQuestion = async () => {
        const isComplete =
            activitySession?.gameSession?.currentQuestion ===
            activitySession?.gameSession?.questions?.length
        const userPercentage =
            (activitySession?.gameSession?.numberCorrect /
                activitySession?.gameSession?.numberAnswered) *
            100
        const passed =
            isComplete &&
            userPercentage >= activitySession?.activity?.percentToPass

        const now = new Date()

        const updateActivitySession = {
            id: activitySession?.id,
            isComplete,
            passed,
            updatedAt: now,
        }

        const updateGameSession = {
            id: activitySession?.gameSessionId,
            completedAt: isComplete ? now : null,
            isComplete,
            currentQuestion:
                activitySession?.gameSession?.currentQuestion +
                (activitySession?.gameSession?.currentQuestion ===
                activitySession?.gameSession?.questions?.length
                    ? 0
                    : 1),
        }

        const optimisticData = {
            ...activitySession,
            ...updateActivitySession,
            gameSession: {
                ...activitySession?.gameSession,
                ...updateGameSession,
            },
        }

        console.log(optimisticData, 'optimisticdata')

        try {
            await mutate(
                `${ACTIVITY_SESSION_URL}/${activitySession?.id}`,
                activitySessionService
                    .updateActivitySession({
                        ...updateActivitySession,
                        gameSession: {
                            update: {
                                ...updateGameSession,
                            },
                        },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.ACTIVITY_SESSION,
                            operation: CRUDOperation.UPDATE,
                            status: MessageStatus.SUCCESS,
                        })
                        return res.data
                    }),
                {
                    optimisticData,
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            await printError({
                err,
                model: Models.ACTIVITY_SESSION,
                operation: CRUDOperation.UPDATE,
            })
        }
        mutate(ACTIVITY_URL)
    }

    return {
        createActivitySession,
        gradeActivityAnswer,
        advanceActivityGameQuestion,
    }
}
