import { http } from '../http'
import { AnswersToGrade } from '@/pages/api/toGrade/[...cursor]'

class GradeAnswerService {
    private GRADING_ENDPOINT = '/toGrade'

    private endpointWithCursor = (cursor?: string) =>
        `${this.GRADING_ENDPOINT}/${cursor || ''}`

    getAnswers = async (cursor?: string) =>
        await http.get<Array<AnswersToGrade>>(this.endpointWithCursor(cursor))
}

export const gradeAnswerService = new GradeAnswerService()
