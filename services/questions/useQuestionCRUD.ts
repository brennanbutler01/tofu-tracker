import { useQuestionSWR } from '@/services/questions/useQuestionSWR'
import { useSWRConfig } from 'swr'
import { Prisma, Question } from '@prisma/client'
import { useSession } from 'next-auth/react'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { questionService } from '@/services/questions/questionService'
import { IQuestionForm } from '@/questions/QuestionForm'
import cuid from 'cuid'
import { useRouter } from 'next/router'

//this function parses a Prisma Question input and returns a Question object suitable for our local storage.
const mutateNewQuestion = (newQuestion: Prisma.QuestionCreateInput) => {
    const { options, deck, ...rest } = newQuestion
    return {
        ...rest,
        // options: [{ ...options?.create }],
        deckId: deck?.connect?.id as string,
    } as Question
}

export const QUESTION_URL = '/api/questions'

//contains CRUD Operations to update our Question local state + DB together.
export const useQuestionCRUD = () => {
    const { mutate, cache } = useSWRConfig()
    const { data: session } = useSession()
    const { query } = useRouter()
    const questions = useQuestionSWR(undefined, query.id as string)

    console.log('cache', cache)

    //this function is used to delete the passed in Question and then mutate the local state if successful.
    const deleteQuestion = async (question: Question) => {
        try {
            await mutate(
                QUESTION_URL,
                questionService
                    .deleteQuestion({ id: question.id })
                    .then(res => {
                        //show the user that the item was deleted with a toast notification
                        messageConfig({
                            model: Models.QUESTION,
                            operation: CRUDOperation.DELETE,
                            status: MessageStatus.SUCCESS,
                        })
                        //return our mutated data to update the cache.
                        return questions?.filter(q => q.id !== res.data.id)
                    }),
                {
                    //we will pass in our optimistic update to try to update the local state immediately.
                    optimisticData:
                        questions?.filter(q => q.id !== question.id) ?? [],
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            console.log('Error in deleting record: ', err)
            messageConfig({
                model: Models.QUESTION,
                operation: CRUDOperation.DELETE,
                status: MessageStatus.ERROR,
            })
        }
    }

    //this function is used to create a new QUESTION from the passed in values and mutate the local state
    const createQuestion = async (values: IQuestionForm) => {
        if (session?.user?.userId) {
            //this is the new question that we would like to build
            const newQuestion: Prisma.QuestionCreateInput = {
                id: cuid(),
                created: new Date(),
                correctAnswer: `${values.correctAnswer}`,
                // options: {
                //   create: {
                //     id: cuid(),
                //     created: new Date(),
                //     answer: `${values.answer}`,
                //   },
                // },
                deck: {
                    connect: {
                        id: query.id as string,
                    },
                },
                question: values.question,
                type: values.type,
            }

            try {
                await mutate(
                    `${QUESTION_URL}/${query.id}`,
                    await questionService
                        .createQuestion(newQuestion)
                        .then(res => {
                            //let the user know that they have created a new question
                            messageConfig({
                                model: Models.QUESTION,
                                status: MessageStatus.SUCCESS,
                                operation: CRUDOperation.CREATE,
                            })
                            //return our updated local state - we added our new question at the end of the array of questions
                            return [...questions, res.data]
                        }),
                    {
                        optimisticData: [
                            ...(questions ? [...questions] : []),
                            mutateNewQuestion(newQuestion),
                        ],
                        rollbackOnError: true,
                    }
                )
            } catch (err) {
                console.log(`Error trying to create a new Question: ${err}`)
                messageConfig({
                    model: Models.QUESTION,
                    status: MessageStatus.ERROR,
                    operation: CRUDOperation.CREATE,
                })
            }
        }
    }

    //this function is used to update the passed in QUESTION and mutate the local state.
    const updateQuestion = async (question: Question) => {
        try {
            await mutate(
                QUESTION_URL,
                questionService
                    .updateQuestion({
                        id: question.id,
                        question: question.question,
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.QUESTION,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return [
                            ...questions.map(q =>
                                q.id === question.id ? res.data : q
                            ),
                        ]
                    }),
                {
                    optimisticData: [
                        ...questions.filter(q => q.id !== question.id),
                        { ...question, question: question.question },
                    ],
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            console.log(`Error updating question: ${err}`)
            messageConfig({
                model: Models.QUESTION,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
        }
    }

    return { deleteQuestion, createQuestion, updateQuestion }
}
