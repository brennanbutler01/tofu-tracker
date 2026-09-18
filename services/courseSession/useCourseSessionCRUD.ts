import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import { message } from 'antd'
import type { CreateGameAnswerValues } from '@/services/games/useGameCRUD'
import { courseSessionService } from './courseSessionService'
export const COURSE_SESSION_API = '/api/courseSession'
export const useCourseSessionCRUD = () => {
    const { mutate } = useSWRConfig()
    const { query } = useRouter()
    const id = typeof query.id === 'string' ? query.id : undefined
    const createCourseSession = async (input: { courseId: string }) => {
        try {
            const response = await courseSessionService.createCourseSession(
                input
            )
            await mutate(COURSE_SESSION_API)
            return response.data.id
        } catch {
            message.error('Could not start this course. Please try again.')
            return undefined
        }
    }
    const gradeCourseAnswer = async (input: CreateGameAnswerValues) => {
        if (!id) return undefined
        try {
            const response = await courseSessionService.updateCourseSession(
                id,
                {
                    action: 'answer',
                    questionId: input.questionId,
                    answer: input.answer,
                }
            )
            await mutate(`${COURSE_SESSION_API}/${id}`, response.data, false)
            return response.data.gameSession.answerHistory.find(
                answer => answer.questionId === input.questionId
            )?.isCorrect
        } catch {
            message.error('Could not save your answer. Please try again.')
            return undefined
        }
    }
    const advanceCourseQuestion = async () => {
        if (!id) return false
        try {
            const response = await courseSessionService.updateCourseSession(
                id,
                { action: 'advance' }
            )
            await mutate(`${COURSE_SESSION_API}/${id}`, response.data, false)
            await mutate(COURSE_SESSION_API)
            return true
        } catch {
            message.error('Could not advance this course. Please try again.')
            return false
        }
    }
    return { createCourseSession, gradeCourseAnswer, advanceCourseQuestion }
}
