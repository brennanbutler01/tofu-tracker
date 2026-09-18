import { http } from '../http'
import type { FullActivitySession } from 'server/sessionShapes'
import type { GameAction } from 'server/gameSessions'
export const activitySessionService = {
    createActivitySession: (input: { activityId: string }) =>
        http.request<FullActivitySession>({
            method: 'POST',
            url: '/activitySession',
            data: input,
        }),
    updateActivitySession: (id: string, action: GameAction) =>
        http.request<FullActivitySession>({
            method: 'PUT',
            url: `/activitySession/${id}`,
            data: action,
        }),
}
export default activitySessionService
