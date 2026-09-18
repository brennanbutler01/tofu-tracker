import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import { message } from 'antd'
import type { QuestionWithOptions } from '@/pages/decks/[id]'
import { gameService } from './gameService'
export const GAME_URL = '/api/games'
export interface CreateGameAnswerValues {
    questionId: string
    answer: string
}
interface CreateGame {
    id: string
    questions: QuestionWithOptions[]
    title: string
}
export type CreateGameSessionType = (
    input: CreateGame
) => Promise<string | undefined>
export const useGameCRUD = () => {
    const { mutate } = useSWRConfig()
    const { query } = useRouter()
    const id = typeof query.id === 'string' ? query.id : undefined
    const createGameSession: CreateGameSessionType = async ({
        id,
        questions,
        title,
    }) => {
        try {
            const response = await gameService.createGameSession({
                id,
                title,
                questionIds: questions.map(q => q.id),
            })
            await mutate(GAME_URL)
            return response.data.id
        } catch {
            message.error('Could not start this game. Please try again.')
            return undefined
        }
    }
    const createGameAnswer = async (input: CreateGameAnswerValues) => {
        if (!id) return undefined
        try {
            const response = await gameService.updateGameSession(id, {
                action: 'answer',
                questionId: input.questionId,
                answer: input.answer,
            })
            await mutate(`${GAME_URL}/${id}`, response.data, false)
            return response.data.answerHistory.find(
                answer => answer.questionId === input.questionId
            )?.isCorrect
        } catch {
            message.error('Could not save your answer. Please try again.')
            return undefined
        }
    }
    const advanceGameQuestion = async () => {
        if (!id) return false
        try {
            const response = await gameService.updateGameSession(id, {
                action: 'advance',
            })
            await mutate(`${GAME_URL}/${id}`, response.data, false)
            return true
        } catch {
            message.error('Could not advance this game. Please try again.')
            return false
        }
    }
    return { createGameSession, createGameAnswer, advanceGameQuestion }
}
