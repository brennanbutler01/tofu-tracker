import useSWR from 'swr'
import { useRouter } from 'next/router'
import { FullCourseSession } from '@/pages/api/courseSession/[id]'

interface ICourseSession {
    fallbackData?: FullCourseSession
    id?: string
}

export const useSingularCourseSessionSWR = ({
    fallbackData,
    id,
}: ICourseSession) => {
    const { data, error, isValidating } = useSWR(`/api/courseSession/${id}`, {
        fallbackData,
    })
    return data as FullCourseSession
}
