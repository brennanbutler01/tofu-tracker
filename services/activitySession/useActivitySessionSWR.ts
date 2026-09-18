import { FullActivitySession } from '@/pages/api/activitySession'
import useSWR from 'swr'
import { ACTIVITY_SESSION_URL } from './useActivitySessionCRUD'

interface IActivitySessionSWR {
    fallbackData?: Array<FullActivitySession>
}

export const useActivitySessionSWR = ({
    fallbackData,
}: IActivitySessionSWR) => {
    const data = useSWR(ACTIVITY_SESSION_URL, { fallbackData })
    return data?.data as Array<FullActivitySession>
}
