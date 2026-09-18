import { Prisma } from '@prisma/client'
import { http } from '../http'

class GradingSessionService {
    private GRADING_SESSION_ENDPOINT = '/toGrade/session'
    private singularSession = (id: string) =>
        `${this.GRADING_SESSION_ENDPOINT}/${id}`

    createGradingSession = async (session: Prisma.GradingSessionCreateInput) =>
        await http.post(this.GRADING_SESSION_ENDPOINT, session)
    updateGradingSession = async (session: Prisma.GradingSessionUpdateInput) =>
        await http.put(this.singularSession(session.id as string), session)
}

export const gradingSessionService = new GradingSessionService()
