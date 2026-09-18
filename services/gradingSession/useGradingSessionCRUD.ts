import { CorrectStatus } from '@prisma/client'
import { message } from 'antd'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import { gradingSessionService } from './gradingSessionService'
import type { GradingAction } from '@/server/gradingSessions'
import type { IGradingResourceForm } from '@/components/admin/GradingResourceForm'

export const GRADING_SESSION_URL = '/api/toGrade/session'
export const useGradingSessionCRUD = () => {
    const { mutate } = useSWRConfig()
    const {
        query: { id },
    } = useRouter()
    const createGradingSession = async ({
        answersToGrade,
    }: {
        answersToGrade: string[]
    }) => {
        try {
            const result = await gradingSessionService.createGradingSession(
                answersToGrade
            )
            await mutate('/api/toGrade')
            await mutate(GRADING_SESSION_URL)
            return result.data.id
        } catch {
            message.error(
                'Could not start the review. Refresh the queue and try again.'
            )
            return undefined
        }
    }
    const update = async (action: GradingAction) => {
        if (typeof id !== 'string') return false
        try {
            const result = await gradingSessionService.updateGradingSession(
                id,
                action
            )
            await mutate(`${GRADING_SESSION_URL}/${id}`, result.data, false)
            return true
        } catch {
            message.error(
                'Could not save the review. Your changes are still here. Please try again.'
            )
            return false
        }
    }
    const gradeAnswer = ({
        gameAnswerId,
        isCorrect,
    }: {
        gameAnswerId: string
        isCorrect: CorrectStatus
    }) => {
        if (isCorrect === CorrectStatus.NEEDS_GRADED)
            return Promise.resolve(false)
        return update({ action: 'grade', answerId: gameAnswerId, isCorrect })
    }
    const createCritique = ({
        critique,
        gameAnswerId,
    }: {
        critique: string
        gameAnswerId: string
        userAnswerId: string
    }) => update({ action: 'critique', answerId: gameAnswerId, text: critique })
    const createGradingResource = ({
        gameAnswerId,
        title,
        location,
        description,
        tags,
    }: IGradingResourceForm & { gameAnswerId: string; critiqueId: string }) =>
        update({
            action: 'resource',
            answerId: gameAnswerId,
            title,
            location,
            description: description || '',
            tags: tags || [],
        })
    return {
        createGradingSession,
        gradeAnswer,
        createCritique,
        createGradingResource,
        moveGradingSession: () => update({ action: 'advance' }),
    }
}
