import { FullActivitySession } from '@/pages/api/activitySession'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { ACTIVITY_SESSION_URL } from './useActivitySessionCRUD'

interface IUseSingleActivitySessionSWR {
    enabled?: boolean
    fallbackData?: FullActivitySession
}

export const useSingleActivitySessionSWR = ({
    fallbackData,
    enabled = true,
}: IUseSingleActivitySessionSWR) => {
    const { query } = useRouter()
    const data = useSWR(
        enabled && typeof query.id === 'string'
            ? `${ACTIVITY_SESSION_URL}/${query.id}`
            : null,
        { fallbackData }
    )
    return {
        data: data.data as FullActivitySession,
        error: data.error && !data.data,
        isLoading: !data.data || data.isValidating,
    }
}
