import type { FullGradingSession } from '@/server/gradingShapes'
import type { GradingAction } from '@/server/gradingSessions'
import { http } from '../http'
class GradingSessionService {
    createGradingSession = (answerIds: string[]) =>
        http.request<FullGradingSession>({
            method: 'POST',
            url: '/toGrade/session',
            data: { answerIds },
        })
    updateGradingSession = (id: string, action: GradingAction) =>
        http.request<FullGradingSession>({
            method: 'PUT',
            url: `/toGrade/session/${id}`,
            data: action,
        })
}
export const gradingSessionService = new GradingSessionService()
