import { Prisma } from '@prisma/client'
import { gameWithQuestionsOptions, orderGameQuestions } from './gameShapes'
export const fullActivitySessions =
    Prisma.validator<Prisma.ActivitySessionDefaultArgs>()({
        include: { activity: true, gameSession: gameWithQuestionsOptions },
    })
export const fullCourseSession =
    Prisma.validator<Prisma.CourseSessionDefaultArgs>()({
        include: { course: true, gameSession: gameWithQuestionsOptions },
    })
export type FullActivitySession = Prisma.ActivitySessionGetPayload<
    typeof fullActivitySessions
>
export type FullCourseSession = Prisma.CourseSessionGetPayload<
    typeof fullCourseSession
>
export function orderActivitySession(session: FullActivitySession) {
    return { ...session, gameSession: orderGameQuestions(session.gameSession) }
}
export function orderCourseSession(session: FullCourseSession) {
    return { ...session, gameSession: orderGameQuestions(session.gameSession) }
}
