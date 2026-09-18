import useSWR from 'swr'
import { FullGradingSession } from '@/pages/api/toGrade/session/[id]'
import { GRADING_SESSION_URL } from '@/services/gradingSession/useGradingSessionCRUD'

interface IGradeSession {
    fallbackData?: FullGradingSession
    gradingSessionId?: string
}

export const useGradingSessionSWR = ({
    fallbackData,
    gradingSessionId,
}: IGradeSession) => {
    const { data } = useSWR(
        `${GRADING_SESSION_URL}${
            gradingSessionId ? `/${gradingSessionId}` : ''
        }`,
        { fallbackData }
    )
    return data as FullGradingSession
}
