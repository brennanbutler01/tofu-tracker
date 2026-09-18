import { UserFeedback } from '@prisma/client'
import useSWR from 'swr'

interface IUseUserFeedbackSWR {
    fallbackData?: UserFeedback
}

export const useUserFeedbackSWR = ({ fallbackData }: IUseUserFeedbackSWR) => {
    const data = useSWR('/api/userFeedback')
    return data.data as UserFeedback
}
