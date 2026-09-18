import { IFeedbackForm } from '@/components/userFeedback/FeedbackForm'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { printError } from '@/utils/printError.utils'
import cuid from 'cuid'
import { useSession } from 'next-auth/react'
import { useSWRConfig } from 'swr'
import { userFeedbackService } from './userFeedbackService'

export const USER_FEEDBACK_API = '/api/userFeedback'

export const useUserFeedbackCRUD = () => {
    const { mutate } = useSWRConfig()
    const session = useSession()
    const createFeedback = async (val: IFeedbackForm) => {
        try {
            await mutate(
                USER_FEEDBACK_API,
                userFeedbackService
                    .createUserFeedback({
                        id: cuid(),
                        ...val,
                        created: new Date(),
                        updatedAt: new Date(),
                        user: {
                            connect: {
                                id: session?.data?.user?.userId,
                            },
                        },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.FEEDBACK,
                            operation: CRUDOperation.CREATE,
                            status: MessageStatus.SUCCESS,
                        })
                        return res.data
                    })
            )
        } catch (err) {
            await printError({
                err,
                model: Models.FEEDBACK,
                operation: CRUDOperation.CREATE,
            })
        }
    }
    return { createFeedback }
}
