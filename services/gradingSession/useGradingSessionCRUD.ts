import { CorrectStatus, Prisma } from '@prisma/client'
import cuid from 'cuid'
import { useSession } from 'next-auth/react'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { useSWRConfig } from 'swr'
import { gradingSessionService } from '@/services/gradingSession/gradingSessionService'
import { useRouter } from 'next/router'
import { useGradingSessionSWR } from '@/services/gradingSession/useGradingSessionSWR'
import { FullGradingSession } from '@/pages/api/toGrade/session/[id]'
import { IGradingResourceForm } from '@/components/admin/GradingResourceForm'

interface ICreateGradingSession {
    answersToGrade: Array<string>
}

interface IGradeAnswer {
    isCorrect: CorrectStatus
    gameAnswerId: string
}

interface ICreateCritique extends Pick<IGradeAnswer, 'gameAnswerId'> {
    critique: string
    userAnswerId: string
}

interface ICreateGradingResource extends IGradingResourceForm {
    gameAnswerId: string
    critiqueId: string
}

export const GRADING_SESSION_URL = '/api/toGrade/session'

export const useGradingSessionCRUD = () => {
    const { data: session } = useSession()
    const { mutate } = useSWRConfig()
    const {
        query: { id },
    } = useRouter()
    const gradingSession = useGradingSessionSWR({
        gradingSessionId: id as string,
    })

    const createGradingSession = async ({
        answersToGrade,
    }: ICreateGradingSession) => {
        const newSession: Prisma.GradingSessionCreateInput = {
            id: cuid(),
            created: new Date(),
            gradedBy: {
                connect: {
                    id: session?.user?.userId,
                },
            },
            answersToGrade: {
                connect: answersToGrade.map(a => ({ id: a })),
            },
            currentAnswer: answersToGrade[0],
        }
        try {
            await mutate(
                GRADING_SESSION_URL,
                gradingSessionService
                    .createGradingSession(newSession)
                    .then(res => {
                        messageConfig({
                            model: Models.GRADING_SESSION,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.CREATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    // optimisticData: {
                    //
                    // }
                }
            )
            return newSession?.id
        } catch (e) {
            console.log('Error trying to create grading session: ', e)
            messageConfig({
                model: Models.GRADING_SESSION,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.CREATE,
            })
        }
    }

    const moveGradingSession = async () => {
        const isLastAnswer =
            gradingSession?.answersToGrade?.filter(
                a => a.isCorrect === CorrectStatus.NEEDS_GRADED
            )?.length === 0

        const updateGradingSession: Prisma.GradingSessionUpdateInput = {
            id: id as string,
            ...(!isLastAnswer && {
                currentAnswer: gradingSession?.answersToGrade?.find(
                    a => a.isCorrect === CorrectStatus.NEEDS_GRADED
                )?.id,
            }),
            isComplete: isLastAnswer,
        }

        try {
            await mutate(
                `${GRADING_SESSION_URL}/${id}`,
                gradingSessionService
                    .updateGradingSession(updateGradingSession)
                    .then(res => {
                        messageConfig({
                            model: Models.GRADING_SESSION,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...gradingSession,
                        currentAnswer: isLastAnswer
                            ? gradingSession?.currentAnswer
                            : gradingSession?.currentAnswer + 1,
                        isComplete: isLastAnswer,
                    } as FullGradingSession,
                }
            )
        } catch (err) {
            console.log(`Error when trying to move grading session ${err}`)
        }
    }

    const gradeAnswer = async ({ gameAnswerId, isCorrect }: IGradeAnswer) => {
        const updateGradingSession: Prisma.GradingSessionUpdateInput = {
            id: id as string,
            answersToGrade: {
                update: {
                    where: {
                        id: gameAnswerId,
                    },
                    data: {
                        isCorrect:
                            isCorrect === CorrectStatus.TRUE
                                ? CorrectStatus.TRUE
                                : CorrectStatus.FALSE,
                    },
                },
            },
        }
        console.log(updateGradingSession)
        try {
            await mutate(
                `${GRADING_SESSION_URL}/${id}`,
                gradingSessionService
                    .updateGradingSession(updateGradingSession)
                    .then(res => {
                        messageConfig({
                            operation: CRUDOperation.UPDATE,
                            status: MessageStatus.SUCCESS,
                            model: Models.GRADING_SESSION,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...gradingSession,
                        answersToGrade: gradingSession?.answersToGrade?.map(a =>
                            a.id === gameAnswerId ? { ...a, isCorrect } : a
                        ),
                    } as FullGradingSession,
                }
            )
        } catch (e) {
            messageConfig({
                operation: CRUDOperation.UPDATE,
                status: MessageStatus.ERROR,
                model: Models.GRADING_SESSION,
            })
            console.log('Error updating grading session ', e)
        }
    }

    const createCritique = async ({
        critique,
        gameAnswerId,
        userAnswerId,
    }: ICreateCritique) => {
        const gradedById = session?.user?.userId as string

        const createCritique: Prisma.GradingCritiqueUncheckedCreateWithoutGameAnswerInput =
            {
                critique,
                created: new Date(),
                id: cuid(),
                gradedById,
                userAnswerId,
            }

        const updateGradingSession: Prisma.GradingSessionUpdateInput = {
            id: id as string,
            answersToGrade: {
                update: {
                    where: {
                        id: gameAnswerId,
                    },
                    data: {
                        critique: { create: createCritique },
                    },
                },
            },
        }

        try {
            await mutate(
                `${GRADING_SESSION_URL}/${id}`,
                gradingSessionService
                    .updateGradingSession(updateGradingSession)
                    .then(res => {
                        messageConfig({
                            model: Models.GRADING_SESSION,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...gradingSession,
                        answersToGrade: gradingSession?.answersToGrade?.map(a =>
                            a.id === gameAnswerId
                                ? { ...a, critique: createCritique }
                                : a
                        ),
                    } as FullGradingSession,
                }
            )
        } catch (err) {
            console.log('Error creating critique ' + err)
            messageConfig({
                model: Models.GRADING_SESSION,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
        }
    }

    const createGradingResource = async ({
        gameAnswerId,
        critiqueId,
        description,
        location,
        title,
        tags,
    }: ICreateGradingResource) => {
        const newResource = {
            id: cuid(),
            created: new Date(),
            updatedAt: new Date(),
            tags,
            title,
            description,
            location,
        }

        const updateGradingSession: Prisma.GradingSessionUpdateInput = {
            id: id as string,
            answersToGrade: {
                update: {
                    where: {
                        id: gameAnswerId,
                    },
                    data: {
                        critique: {
                            update: {
                                id: critiqueId,
                                resources: {
                                    create: newResource,
                                },
                            },
                        },
                    },
                },
            },
        }

        try {
            await mutate(
                `${GRADING_SESSION_URL}/${id}`,
                gradingSessionService
                    .updateGradingSession(updateGradingSession)
                    .then(res => {
                        messageConfig({
                            operation: CRUDOperation.CREATE,
                            status: MessageStatus.SUCCESS,
                            model: Models.RESOURCES,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...gradingSession,
                        answersToGrade: gradingSession?.answersToGrade.map(a =>
                            a.id === gameAnswerId
                                ? {
                                      ...a,
                                      critique: {
                                          ...a.critique,
                                          resources: [
                                              ...(a?.critique?.resources || []),
                                              newResource,
                                          ],
                                      },
                                  }
                                : a
                        ),
                    } as FullGradingSession,
                }
            )
        } catch (err) {
            console.log('Error trying to create resource. ' + err)
            messageConfig({
                model: Models.RESOURCES,
                operation: CRUDOperation.CREATE,
                status: MessageStatus.ERROR,
            })
        }
    }

    return {
        createGradingSession,
        gradeAnswer,
        moveGradingSession,
        createGradingResource,
        createCritique,
    }
}
