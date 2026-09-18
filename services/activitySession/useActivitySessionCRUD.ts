import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import { message } from 'antd'
import type { CreateGameAnswerValues } from '@/services/games/useGameCRUD'
import { activitySessionService } from './activitySessionService'
export const ACTIVITY_SESSION_URL = '/api/activitySession'
export const useActivitySessionCRUD = () => {
    const { mutate } = useSWRConfig()
    const { query } = useRouter()
    const id = typeof query.id === 'string' ? query.id : undefined
    const createActivitySession = async (input: { activityId: string }) => {
        try {
            const response = await activitySessionService.createActivitySession(
                input
            )
            await mutate(ACTIVITY_SESSION_URL)
            return response.data.id
        } catch {
            message.error('Could not start this activity. Please try again.')
            return undefined
        }
    }
    const gradeActivityAnswer = async (input: CreateGameAnswerValues) => {
        if (!id) return undefined
        try {
            const response = await activitySessionService.updateActivitySession(
                id,
                {
                    action: 'answer',
                    questionId: input.questionId,
                    answer: input.answer,
                }
            )
            await mutate(`${ACTIVITY_SESSION_URL}/${id}`, response.data, false)
            return response.data.gameSession.answerHistory.find(
                answer => answer.questionId === input.questionId
            )?.isCorrect
        } catch {
            message.error('Could not save your answer. Please try again.')
            return undefined
        }
    }
    const advanceActivityGameQuestion = async () => {
        if (!id) return false
        try {
            const response = await activitySessionService.updateActivitySession(
                id,
                { action: 'advance' }
            )
            await mutate(`${ACTIVITY_SESSION_URL}/${id}`, response.data, false)
            await mutate(ACTIVITY_SESSION_URL)
            return true
        } catch {
            message.error('Could not advance this activity. Please try again.')
            return false
        }
    }
    return {
        createActivitySession,
        gradeActivityAnswer,
        advanceActivityGameQuestion,
    }
}
