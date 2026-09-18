import { http } from '../http'
import type { FullCourseSession } from 'server/sessionShapes'
import type { GameAction } from 'server/gameSessions'
export const courseSessionService = {
    createCourseSession: (input: { courseId: string }) =>
        http.request<FullCourseSession>({
            method: 'POST',
            url: '/courseSession',
            data: input,
        }),
    updateCourseSession: (id: string, action: GameAction) =>
        http.request<FullCourseSession>({
            method: 'PUT',
            url: `/courseSession/${id}`,
            data: action,
        }),
}
export default courseSessionService
