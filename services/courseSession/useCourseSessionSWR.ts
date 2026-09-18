import useSWR from 'swr'
import { FullCourseSession } from '@/pages/api/courseSession/[id]'

interface ICourseSession {
    fallbackData?: Array<FullCourseSession>
}

export const useCourseSessionSWR = ({ fallbackData }: ICourseSession) => {
    const { data } = useSWR('/api/courseSession', { fallbackData })
    return data as Array<FullCourseSession>
}
