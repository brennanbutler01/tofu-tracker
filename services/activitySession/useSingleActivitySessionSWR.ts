import { FullActivitySession } from '@/pages/api/activitySession'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { ACTIVITY_SESSION_URL } from './useActivitySessionCRUD'

interface IUseSingleActivitySessionSWR {
    fallbackData?: FullActivitySession
}

export const useSingleActivitySessionSWR = ({
    fallbackData,
}: IUseSingleActivitySessionSWR) => {
    const { query } = useRouter()
    const data = useSWR(`${ACTIVITY_SESSION_URL}/${query.id}`)
    return {
        data: data.data as FullActivitySession,
        error: data.error && !data.data,
        isLoading: !data.data || data.isValidating,
    }
}
