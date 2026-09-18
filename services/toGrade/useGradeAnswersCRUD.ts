import { gradeAnswerService } from '@/services/toGrade/gradeAnswerService'
import { useSWRConfig } from 'swr'
import { useGradeAnswersSWR } from '@/services/toGrade/useGradeAnswersSWR'

export const GRADE_URL = '/api/toGrade'
export const useGradeAnswersCRUD = () => {
    const { mutate } = useSWRConfig()
    const answersToGrade = useGradeAnswersSWR({})
    const moveGradingCursor = async (cursor: string) => {
        try {
            await mutate(
                `${GRADE_URL}/${cursor}`,
                gradeAnswerService.getAnswers(cursor).then(res => {
                    return [...answersToGrade, ...res?.data]
                }),
                { rollbackOnError: true }
            )
        } catch (err) {
            console.log('error moving grading cursor', err)
        }
        return await gradeAnswerService.getAnswers(cursor)
    }
    return { moveGradingCursor }
}
