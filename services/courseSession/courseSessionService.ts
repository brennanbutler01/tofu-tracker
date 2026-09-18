import { Prisma } from '@prisma/client'
import { http } from '../http'

class CourseSessionService {
    private COURSE_SESSION_ENDPOINT = '/courseSession'

    createCourseSession = async (session: Prisma.CourseSessionCreateInput) =>
        await http.post<Prisma.CourseSessionCreateInput>(
            this.COURSE_SESSION_ENDPOINT,
            session
        )
    updateCourseSession = async (session: Prisma.CourseSessionUpdateInput) =>
        await http.put<Prisma.CourseSessionUpdateInput>(
            `${this.COURSE_SESSION_ENDPOINT}/${session.id}`,
            session
        )
    // updateDeck = async (deck: Prisma.DeckUpdateInput) =>
    //   await http.put(this.singularDeck(deck), deck);
    // updateDeckWithQuestions = async (deck: Prisma.DeckUpdateInput) =>
    //   await http.put(`/decks/questions/${deck.id}`, deck);
    // deleteDeck = async (deck: Prisma.DeckWhereInput) =>
    //   await http.delete<Prisma.DeckWhereInput>(this.singularDeck(deck));
}

export const courseSessionService = new CourseSessionService()
