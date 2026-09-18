import useSWR from 'swr'
import { useRouter } from 'next/router'
import { FullCourseSession } from '@/pages/api/courseSession/[id]'

interface ICourseSession {
    fallbackData?: FullCourseSession
    id?: string
    enabled?: boolean
}

export const useSingularCourseSessionSWR = ({
    fallbackData,
    id,
    enabled = true,
}: ICourseSession) => {
    const { data, error, isValidating } = useSWR(
        enabled && id ? `/api/courseSession/${id}` : null,
        {
            fallbackData,
        }
    )
    return data as FullCourseSession
}
