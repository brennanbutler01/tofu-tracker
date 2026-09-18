//contains CRUD operations to update our Deck local State + DB / questions
import { useRouter } from 'next/router'
import { useDeckQuestionsSWR } from '@/services/decks/questions/useDeckQuestionsSWR'
import { useSWRConfig } from 'swr'
import { IQuestionForm, OptionValue } from '@/questions/QuestionForm'
import cuid from 'cuid'
import { Prisma, Question, QuestionType } from '@prisma/client'
import { deckQuestionService } from '@/services/decks/questions/deckQuestionService'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { DeckWithQuestions } from '@/pages/decks/[id]'
import React from 'react'

export const DECK_QUESTION = '/api/decks/questions'

const answerProps = (answer: string) => ({
    id: cuid(),
    created: new Date(),
    answer,
})

interface IQuestionTableValues {
    id: string
    type: QuestionType
    question: string
}

interface IUpdateQuestionAnswer {
    id: string
    correctAnswer: string
}

interface IDeleteQuestionAnswers {
    questionId: string
    keysToDelete: Array<React.Key>
}

interface ICreateQuestionOptions {
    questionId: string
    options: Array<OptionValue>
}

export const useDeckQuestionCRUD = () => {
    const {
        query: { id },
    } = useRouter()
    const deck = useDeckQuestionsSWR(id as string)
    const { mutate } = useSWRConfig()

    const MUTATE_DECK_URL = `${DECK_QUESTION}/${id}`

    // this function is used to update our Deck with our new Questions
    const createDeckQuestion = async (val: IQuestionForm) => {
        console.log('created deck question vals', val)
        //create our question options - these will be the choices that a user has to pick from when trying to answer out question
        const createAnswerOptions = val?.options?.map(option =>
            answerProps(option.text)
        )

        //parse our question from the form values
        const newQuestion: Prisma.QuestionCreateWithoutDeckInput = {
            correctAnswer: val.correctAnswer.toString(),
            question: val.question,
            type: val.type,
            id: cuid(),
            explanation: val.explanation || null,
            simpleResponseType: val.simpleResponseInputType,
            ...((val.type === QuestionType.TRUE_FALSE ||
                val.type === QuestionType.MULTIPLE_CHOICE) && {
                options: {
                    createMany: { data: createAnswerOptions },
                },
            }),
        }

        //this is our prisma object to update deck
        const updateDeck: Prisma.DeckUpdateInput = {
            id: deck.id,
            questions: { create: newQuestion },
        }

        try {
            await mutate(
                MUTATE_DECK_URL,
                deckQuestionService.createDeckQuestion(updateDeck).then(() => {
                    messageConfig({
                        model: Models.QUESTION,
                        status: MessageStatus.SUCCESS,
                        operation: CRUDOperation.CREATE,
                    })
                    //we pass the updated deck to our db, and return our mutated deck
                    return {
                        ...deck,
                        questions: [
                            ...deck.questions,
                            { ...newQuestion, options: createAnswerOptions },
                        ],
                    }
                }),
                {
                    //this is the data that should update our local state
                    optimisticData: {
                        ...deck,
                        questions: [
                            ...deck?.questions,
                            {
                                ...newQuestion,
                                deckId: deck.id,
                                options: createAnswerOptions,
                            },
                        ],
                    },
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.QUESTION,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.CREATE,
            })
            console.log('error updating deck with questions...', err)
        }
    }

    //this function is used to Delete a question from our Deck with questions
    const deleteDeckQuestion = async (question: Question) => {
        try {
            await mutate(
                MUTATE_DECK_URL,
                deckQuestionService
                    .deleteDeckQuestion({ id: id as string }, question.id)
                    .then(res => {
                        messageConfig({
                            model: Models.QUESTION,
                            operation: CRUDOperation.DELETE,
                            status: MessageStatus.SUCCESS,
                        })
                        // return res.data;
                        return {
                            ...deck,
                            questions: [
                                ...deck?.questions.filter(
                                    q => q.id !== question.id
                                ),
                            ],
                        }
                    }),
                {
                    optimisticData: {
                        ...deck,
                        questions: [
                            ...deck?.questions?.filter(
                                deckQ => deckQ.id !== question.id
                            ),
                        ],
                    },
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.QUESTION,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.DELETE,
            })
            console.log('error deleting deck question ... ', err)
        }
    }

    //this function is used to Update a question from our Deck with questions
    const updateDeckQuestion = async (question: IQuestionTableValues) => {
        const updateDeck: Prisma.DeckUpdateInput = {
            id: deck.id,
            questions: {
                update: {
                    where: {
                        id: question.id,
                    },
                    data: {
                        ...question,
                    },
                },
            },
        }

        try {
            await mutate(
                MUTATE_DECK_URL,
                deckQuestionService.updateDeckQuestion(updateDeck).then(res => {
                    messageConfig({
                        model: Models.DECK_WITH_QUESTIONS,
                        status: MessageStatus.SUCCESS,
                        operation: CRUDOperation.UPDATE,
                    })
                    return res.data
                }),
                {
                    optimisticData: {
                        ...deck,
                        questions: [
                            ...deck?.questions?.filter(
                                q => q.id !== question.id
                            ),
                            {
                                ...deck.questions.find(
                                    q => q.id === question.id
                                ),
                                ...question,
                            },
                        ],
                    },
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.DECK_WITH_QUESTIONS,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
            console.log(`Error updating deck question... Error: ${err}`)
        }
    }

    // this function is used to update the correct answer for our deck question
    const updateDeckQuestionCorrectAnswer = async (
        values: IUpdateQuestionAnswer
    ) => {
        try {
            console.log(
                'these are our values to update our deck questions correct answer',
                values
            )
            await mutate(
                MUTATE_DECK_URL,
                deckQuestionService
                    .updateDeckQuestion({
                        id: deck.id,
                        questions: {
                            update: {
                                where: {
                                    id: values.id,
                                },
                                data: {
                                    correctAnswer: values.correctAnswer,
                                },
                            },
                        },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.DECK_WITH_QUESTIONS,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...deck,
                        questions: deck.questions.map(q =>
                            q.id === values.id
                                ? {
                                      ...q,
                                      ...values,
                                  }
                                : q
                        ),
                    } as DeckWithQuestions,
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.DECK_WITH_QUESTIONS,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
            console.log(
                `Error trying to update deck question's correct answer... ${err}`
            )
        }
    }

    //this is used to delete options from the options
    const deleteDeckQuestionOptions = async (
        options: IDeleteQuestionAnswers
    ) => {
        try {
            await mutate(
                MUTATE_DECK_URL,
                deckQuestionService
                    .updateDeckQuestion({
                        id: deck.id,
                        questions: {
                            update: {
                                where: {
                                    id: options.questionId,
                                },
                                data: {
                                    options: {
                                        deleteMany: options.keysToDelete.map(
                                            k => ({
                                                id: `${k}`,
                                            })
                                        ),
                                    },
                                },
                            },
                        },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.OPTIONS,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.DELETE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...deck,
                        questions: deck.questions.map(q =>
                            q.id === options.questionId
                                ? {
                                      ...q,
                                      options: q.options.filter(
                                          option =>
                                              options.keysToDelete.indexOf(
                                                  option.id
                                              ) === -1
                                      ),
                                  }
                                : q
                        ),
                    } as DeckWithQuestions,
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.OPTIONS,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.DELETE,
            })
            console.log(`Error trying to delete deck question options...${err}`)
        }
    }

    //used to create additional options for our deck questions
    const createDeckQuestionOptions = async ({
        questionId,
        options: newOptions,
    }: ICreateQuestionOptions) => {
        try {
            const formattedNewOptions = newOptions.reduce((acc, curr) => {
                if (!curr.text) {
                    return acc
                }
                const prismaOption = { id: cuid(), answer: curr.text }
                return [...acc, prismaOption]
            }, [] as Array<Prisma.AnswerOptionCreateManyQuestionInput>)

            await mutate(
                MUTATE_DECK_URL,
                deckQuestionService
                    .updateDeckQuestion({
                        id: deck.id,
                        questions: {
                            update: [
                                {
                                    where: {
                                        id: questionId,
                                    },
                                    data: {
                                        options: {
                                            createMany: {
                                                data: formattedNewOptions,
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.OPTIONS,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.CREATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...deck,
                        questions: deck.questions.map(q =>
                            q.id === questionId
                                ? {
                                      ...q,
                                      options: [
                                          ...q.options,
                                          ...formattedNewOptions.map(
                                              option => ({
                                                  ...option,
                                                  questionId,
                                              })
                                          ),
                                      ],
                                  }
                                : q
                        ),
                    },
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.OPTIONS,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.CREATE,
            })
            console.log('Error trying to create deck question options...', err)
        }
    }

    return {
        createDeckQuestion,
        deleteDeckQuestion,
        updateDeckQuestion,
        updateDeckQuestionCorrectAnswer,
        deleteDeckQuestionOptions,
        createDeckQuestionOptions,
    }
}
