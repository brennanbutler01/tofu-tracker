import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import { message } from 'antd'
import type { Question, QuestionType } from '@prisma/client'
import type { IQuestionForm, OptionValue } from '@/questions/QuestionForm'
import type { DeckQuestionAction } from '@/server/deckAuthoring'
import type { Key } from 'react'
import { deckQuestionService } from './deckQuestionService'
export const DECK_QUESTION = '/api/decks/questions'
export const useDeckQuestionCRUD = () => {
    const {
        query: { id },
    } = useRouter()
    const { mutate } = useSWRConfig()
    const save = async (
        action: DeckQuestionAction | { action: 'archive'; questionId: string }
    ) => {
        if (typeof id !== 'string') return false
        try {
            const result =
                action.action === 'archive'
                    ? await deckQuestionService.remove(id, action.questionId)
                    : await deckQuestionService.update(id, action)
            await mutate(`${DECK_QUESTION}/${id}`, result.data, false)
            await mutate('/api/decks')
            await mutate('/api/questions')
            message.success(
                action.action === 'archive'
                    ? 'Question archived. Existing results are preserved.'
                    : 'Question saved.'
            )
            return true
        } catch {
            message.error(
                'Could not save the question. Check its answer choices and try again.'
            )
            return false
        }
    }
    return {
        createDeckQuestion: (values: IQuestionForm) =>
            save({
                action: 'create',
                question: {
                    question: values.question,
                    type: values.type,
                    correctAnswer: String(values.correctAnswer ?? ''),
                    explanation: values.explanation ?? null,
                    simpleResponseType: values.simpleResponseInputType ?? null,
                    options: values.options?.map(option => option.text) ?? [],
                },
            }),
        deleteDeckQuestion: (question: Question) =>
            save({ action: 'archive', questionId: question.id }),
        updateDeckQuestion: ({
            id,
            question,
            type,
        }: {
            id: string
            question: string
            type: QuestionType
        }) =>
            save({
                action: 'edit',
                questionId: id,
                changes: { question, type },
            }),
        updateDeckQuestionCorrectAnswer: ({
            id,
            correctAnswer,
            explanation,
        }: {
            id: string
            correctAnswer: string
            explanation?: string
        }) =>
            save({
                action: 'edit',
                questionId: id,
                changes: {
                    correctAnswer,
                    ...(explanation === undefined ? {} : { explanation }),
                },
            }),
        deleteDeckQuestionOptions: ({
            questionId,
            keysToDelete,
        }: {
            questionId: string
            keysToDelete: Key[]
        }) =>
            save({
                action: 'removeOptions',
                questionId,
                optionIds: keysToDelete.map(String),
            }),
        createDeckQuestionOptions: ({
            questionId,
            options,
        }: {
            questionId: string
            options: OptionValue[]
        }) =>
            save({
                action: 'addOptions',
                questionId,
                options: options.map(option => option.text),
            }),
    }
}
