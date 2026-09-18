import { Prisma } from '@prisma/client'
import { http } from '../http'

class ActivityService {
    private ACTIVITY_ENDPOINT = '/activities'
    private singularActivity = (
        activity: Prisma.ActivityWhereInput | Prisma.ActivityUpdateInput
    ) => `${this.ACTIVITY_ENDPOINT}/${activity.id}`

    createActivity = async (activity: Prisma.ActivityCreateInput) => {
        await http.post<Prisma.ActivityCreateInput>(
            this.ACTIVITY_ENDPOINT,
            activity
        )
    }
    deleteActivity = async (activity: Prisma.ActivityWhereInput) =>
        await http.delete<Prisma.ActivityWhereInput>(
            this.singularActivity(activity)
        )

    updateActivity = async (activity: Prisma.ActivityUpdateInput) =>
        await http.put<Prisma.ActivityUpdateInput>(
            this.singularActivity(activity),
            activity
        )
}

export const activityService = new ActivityService()
