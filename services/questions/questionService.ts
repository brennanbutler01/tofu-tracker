import { Prisma } from '@prisma/client'
import { http } from '../http'

class QuestionService {
    private QUESTION_ENDPOINT = '/questions'
    private singularQuestion = (
        deck: Prisma.QuestionWhereInput | Prisma.QuestionUpdateInput
    ) => `${this.QUESTION_ENDPOINT}/${deck.id}`

    createQuestion = async (question: Prisma.QuestionCreateInput) =>
        await http.post<Prisma.QuestionCreateInput>(
            this.QUESTION_ENDPOINT,
            question
        )
    updateQuestion = async (question: Prisma.QuestionUpdateInput) =>
        await http.put<Prisma.QuestionUpdateInput>(
            this.singularQuestion(question),
            question
        )
    deleteQuestion = async (question: Prisma.QuestionWhereInput) =>
        await http.delete<Prisma.QuestionWhereInput>(
            this.singularQuestion(question)
        )
}

export const questionService = new QuestionService()
