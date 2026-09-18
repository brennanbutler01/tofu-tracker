import { Prisma } from '@prisma/client'
import { http } from '../http'

class ActivitySessionService {
    private ACTIVITY_SESSION_ENDPOINT = '/activitySession/'
    private singularActivitySession = (id: string) => `/activitySession/${id}`

    createActivitySession = async (
        session: Prisma.ActivitySessionCreateInput
    ) =>
        await http.post<Prisma.ActivitySessionCreateInput>(
            this.ACTIVITY_SESSION_ENDPOINT,
            session
        )

    updateActivitySession = async (
        session: Prisma.ActivitySessionUpdateInput
    ) =>
        await http.put<Prisma.ActivitySessionUpdateInput>(
            this.singularActivitySession(session?.id as string),
            session
        )
}

const activitySessionService = new ActivitySessionService()
export default activitySessionService
