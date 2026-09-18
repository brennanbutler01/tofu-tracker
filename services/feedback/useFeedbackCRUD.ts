import { useSWRConfig } from 'swr'
import { useSession } from 'next-auth/react'
import { message } from 'antd'
import type { ICommentForm } from '@/components/game/ParentCommentEditor'
import type { IResourceForm } from '@/components/game/resources/FeedbackResourceForm'
import type { LikeType } from '@/utils/useLikes'
import type {
    FullQuestionComment,
    FullResourceComment,
    ResourceWithComments,
} from '@/server/feedbackShapes'
import type { FeedbackAction } from '@/server/questionFeedback'
import { feedbackService } from './feedbackService'
export const FEEDBACK_URL = (questionId: string) =>
    `/api/questions/feedback/${questionId}`
export enum LikeActions {
    LIKE,
    DISLIKE,
}
export const useFeedbackCRUD = (questionId: string) => {
    const { mutate } = useSWRConfig()
    const { data: session } = useSession()
    const save = async (command: FeedbackAction) => {
        try {
            const response = await feedbackService.modifyFeedback(
                questionId,
                command
            )
            await mutate(FEEDBACK_URL(questionId), response.data, false)
            return true
        } catch {
            message.error(
                'Could not save feedback. Your entries are still here. Please try again.'
            )
            return false
        }
    }
    const react = async (
        target: 'comment' | 'resourceComment' | 'resource',
        {
            record,
            type,
        }: LikeType<{ id: string; likes: string[]; dislikes: string[] }>
    ) => {
        const selected = type === LikeActions.LIKE ? 'like' : 'dislike'
        const current =
            type === LikeActions.LIKE ? record.likes : record.dislikes
        await save({
            action: 'react',
            target,
            targetId: record.id,
            reaction:
                session?.user?.userId && current.includes(session.user.userId)
                    ? 'none'
                    : selected,
        })
    }
    return {
        createComment: (values: ICommentForm) =>
            save({ action: 'comment', comment: values.comment }),
        createQuestionChildComment: (
            values: ICommentForm & { parentId: string }
        ) => save({ action: 'comment', ...values }),
        createResourceComment: (
            values: ICommentForm & { resourceId: string }
        ) => save({ action: 'comment', ...values }),
        createResourceChildComment: (
            values: ICommentForm & { parentId: string; resourceId: string }
        ) => save({ action: 'comment', ...values }),
        createQuestionFeedback: () => save({ action: 'initialize' }),
        rateQuestion: (rating: number) => save({ action: 'rate', rating }),
        createQuestionResource: (values: IResourceForm & { tags?: string[] }) =>
            save({ action: 'resource', ...values, tags: values.tags ?? [] }),
        editQuestionResource: (
            values: IResourceForm & { resourceId: string; tags?: string[] }
        ) =>
            save({
                action: 'editResource',
                ...values,
                tags: values.tags ?? [],
            }),
        likeDislikeQuestionComment: (values: LikeType<FullQuestionComment>) =>
            react('comment', values),
        likeDislikeResourceComment: (values: LikeType<FullResourceComment>) =>
            react('resourceComment', values),
        likeDislikeResource: (values: LikeType<ResourceWithComments>) =>
            react('resource', values),
    }
}
