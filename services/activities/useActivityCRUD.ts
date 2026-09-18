import { IActivityForm } from '@/components/activities/ActivityForm'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { printError } from '@/utils/printError.utils'
import { Prisma, Question } from '@prisma/client'
import cuid from 'cuid'
import { useSWRConfig } from 'swr'
import { useQuestionSWR } from '../questions/useQuestionSWR'
import { activityService } from './activityService'
import { useActivitySWR } from './useActivitySWR'
import useSingleActivitySWR from './useSingleActivitySWR'

export const ACTIVITY_URL = '/api/activities'

interface ICreateActivity extends Omit<IActivityForm, 'questions'> {
    questions: Array<{ id: string }>
    fullQuestions: Array<Question>
}

export const useActivityCRUD = () => {
    const activities = useActivitySWR({})
    const swrQuestions = useQuestionSWR()
    const { mutate } = useSWRConfig()
    const ourActivity = useSingleActivitySWR({})
    const ourDecks = useActivitySWR({})

    const createActivity = async ({
        questionOrder,
        questions,
        title,
        description,
        displayOnMain,
        percentToPass,
    }: ICreateActivity) => {
        const now = new Date()
        const newActivity: Prisma.ActivityCreateInput = {
            id: cuid(),
            title,
            description,
            created: now,
            updatedAt: now,
            questions: {
                connect: questions,
            },
            questionOrder,
            displayOnMain,
            percentToPass,
        }

        console.log('newActivity', newActivity)

        try {
            await mutate(
                ACTIVITY_URL,
                activityService.createActivity(newActivity).then(res => {
                    messageConfig({
                        model: Models.ACTIVITY,
                        operation: CRUDOperation.CREATE,
                        status: MessageStatus.SUCCESS,
                    })
                    return res
                }),
                {
                    optimisticData: [...activities, newActivity],
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.ACTIVITY,
                operation: CRUDOperation.CREATE,
                status: MessageStatus.ERROR,
            })
            console.log('There was an error creating activity ', err)
        }
    }

    const deleteActivity = async ({ activityId }: { activityId: string }) => {
        const updatedActivities = activities.filter(a => a.id !== activityId)

        console.log('updatedacts', updatedActivities)

        try {
            await mutate(
                ACTIVITY_URL,
                activityService.deleteActivity({ id: activityId }).then(res => {
                    messageConfig({
                        model: Models.ACTIVITY,
                        status: MessageStatus.SUCCESS,
                        operation: CRUDOperation.DELETE,
                    })
                    return updatedActivities
                }),
                {
                    rollbackOnError: true,
                    optimisticData: updatedActivities,
                }
            )
        } catch (err) {
            console.log('There was an error trying to delete activity', err)
            messageConfig({
                model: Models.ACTIVITY,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.DELETE,
            })
        }
    }

    const updateActivity = async ({
        id,
        questions,
        ...rest
    }: Partial<ICreateActivity> & { id: string }) => {
        const questionsToConnect = questions?.filter(
            q => !ourActivity?.questions.find(aQ => aQ.id === q.id)
        )
        const questionsToDisconnect = ourActivity.questions.filter(
            aQ => !questions?.find(q => q.id === aQ.id)
        )

        const mutatedActivities = activities.map(a =>
            a.id === id
                ? {
                      ...a,
                      title: rest.title,
                      description: rest.description,
                      updatedAt: new Date(),
                      questions: questions?.map(q =>
                          swrQuestions.find(sQ => sQ.id === q.id)
                      ),
                      questionOrder: rest.questionOrder,
                      displayOnMain: rest.displayOnMain,
                      percentToPass: rest.percentToPass,
                  }
                : a
        )

        try {
            await mutate(
                ACTIVITY_URL,
                activityService
                    .updateActivity({
                        id,
                        updatedAt: new Date(),
                        ...rest,
                        questions: {
                            connect: questionsToConnect?.map(q => ({
                                id: q.id,
                            })),
                            disconnect: questionsToDisconnect?.map(q => ({
                                id: q.id,
                            })),
                        },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.ACTIVITY,
                            operation: CRUDOperation.UPDATE,
                            status: MessageStatus.SUCCESS,
                        })
                        console.log('mutated activities', mutatedActivities)
                        return mutatedActivities
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: mutatedActivities,
                }
            )
        } catch (err) {
            await printError({
                err,
                model: Models.ACTIVITY,
                operation: CRUDOperation.UPDATE,
            })
        }
    }

    return { createActivity, deleteActivity, updateActivity }
}
