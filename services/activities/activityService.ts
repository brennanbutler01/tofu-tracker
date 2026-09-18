import type { ActivityInput } from '@/server/contentAuthoring'
import type { ActivityWithQuestion } from '@/pages/api/activities'
import { http } from '../http'
export const activityService = {
    createActivity: (data: ActivityInput) =>
        http.request<ActivityWithQuestion>({
            method: 'POST',
            url: '/activities',
            data,
        }),
    updateActivity: (id: string, data: Partial<ActivityInput>) =>
        http.request<ActivityWithQuestion>({
            method: 'PUT',
            url: `/activities/${id}`,
            data,
        }),
    deleteActivity: (id: string) => http.delete(`/activities/${id}`),
}
