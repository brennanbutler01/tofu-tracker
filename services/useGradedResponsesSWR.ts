import { GradedUserResponse } from '@/pages/api/graded'
import useSWR from 'swr'

export const useGradedResponsesSWR = (
    fallbackData?: Array<GradedUserResponse>
) => {
    const { data } = useSWR(`/api/graded`, { fallbackData })
    return data as Array<GradedUserResponse>
}
