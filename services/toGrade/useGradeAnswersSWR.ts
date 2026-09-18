import { GRADE_URL } from '@/services/toGrade/useGradeAnswersCRUD'
import { AnswersToGrade } from '@/pages/api/toGrade/[...cursor]'
import useSWR from 'swr'

interface IGradeAnswer {
    fallbackData?: Array<AnswersToGrade>
    cursor?: string
}

export const useGradeAnswersSWR = ({ fallbackData }: IGradeAnswer) => {
    const { data } = useSWR(GRADE_URL, { fallbackData })
    return data as Array<AnswersToGrade>
}
