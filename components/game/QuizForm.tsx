import { Form, FormInstance, Input, Radio } from 'antd'
import FormLabel from '@/components/FormLabel'
import React, { useEffect, useState } from 'react'
import { useGameCRUD } from '@/services/games/useGameCRUD'
import { QuestionStatus } from '@/components/game/QuizCard'
import styled from 'styled-components'
import { CorrectStatus, QuestionType } from '@prisma/client'
import { QuizProps } from '@/components/game/Quiz'
import { useCourseSessionCRUD } from '@/services/courseSession/useCourseSessionCRUD'
import AnswerStatusAlert, {
    AnswerStatus,
} from '@/components/game/AnswerStatusAlert'
import { answersMatch } from '@/utils/answersMatch'
import { SimpleAnswer } from '@/questions/SimpleAnswer'
import { useGameTypeData } from '@/services/useGameTypeData'
import { useActivitySessionCRUD } from '@/services/activitySession/useActivitySessionCRUD'

const { Item } = Form,
    { Group } = Radio

export interface IQuizForm {
    answer: string | number
}

export interface IQuizProps extends QuizProps {
    setQuestionStatus: React.Dispatch<React.SetStateAction<QuestionStatus>>
    questionStatus: QuestionStatus
    answerStatus: AnswerStatus
    setAnswerStatus: React.Dispatch<React.SetStateAction<AnswerStatus>>
    form: FormInstance
}

const { TextArea } = Input

const StyledDiv = styled.div`
        .ant-radio-disabled,
        .ant-radio-checked .ant-radio-inner {
            border-color: ${props => props.theme['tofu-green']};
        }

        .ant-input[disabled] {
            color: rgba(255, 255, 255, 0.35);
            background-color: ${props => props.theme['tofu-brand-1']};
            border-color: ${props => props.theme['tofu-brand-5']};
            box-shadow: none;
            cursor: not-allowed;
            opacity: 1;
        }
        .ant-input-number-disabled .ant-input-number-input {
            background-color: ${props => props.theme['tofu-brand-1']};
        }
    `,
    StyledGroup = styled(Group)`
        display: flex;
        flex-direction: column;
        gap: 5px;
    `

const QuizForm = ({
    setQuestionStatus,
    questionStatus,
    setAnswerStatus,
    answerStatus,
    form,
    type = 'free',
}: IQuizProps) => {
    const session = useGameTypeData({ type })
    const currentQuestion = session?.questions?.[session?.currentQuestion - 1]
    const currentAnswer = session?.answerHistory?.[session?.currentQuestion - 1]
    const [value, setValue] = useState<string | number>('')

    useEffect(() => {
        //if we have already answered this one and refreshed the page, we will make sure that we show it as answered
        if (currentQuestion?.id === currentAnswer?.questionId) {
            //set the status to answered to change our buttons and make input disabled
            setQuestionStatus(QuestionStatus.ANSWERED)
            form.setFieldsValue({
                answer: currentAnswer?.userAnswer?.answer,
            })

            //display our status
            setAnswerStatus(
                currentAnswer?.isCorrect === CorrectStatus.TRUE
                    ? AnswerStatus.CORRECT
                    : currentAnswer?.isCorrect === CorrectStatus.NEEDS_GRADED &&
                      currentQuestion?.type === QuestionType.FREE_RESPONSE
                    ? AnswerStatus.FREE_RESPONSE_NEEDS_GRADED
                    : currentAnswer?.isCorrect === CorrectStatus.NEEDS_GRADED
                    ? AnswerStatus.NEEDS_GRADED
                    : AnswerStatus.INCORRECT
            )
        }
    }, [
        currentAnswer,
        currentQuestion,
        form,
        setQuestionStatus,
        setAnswerStatus,
    ])

    useEffect(() => {
        if (!currentAnswer && form.getFieldValue('answer')) {
            form.resetFields(['answer'])
        }
    }, [currentAnswer, form])

    const correctAnswer = currentQuestion?.correctAnswer

    const { createGameAnswer } = useGameCRUD()
    const { gradeCourseAnswer } = useCourseSessionCRUD()
    const { gradeActivityAnswer } = useActivitySessionCRUD()

    const evaluateAnswer = (answer: string): CorrectStatus =>
        answersMatch({ answer, expected: correctAnswer })
            ? CorrectStatus.TRUE
            : CorrectStatus.FALSE

    const submitAnswer = async (val: IQuizForm, questionType: QuestionType) => {
        //set our status so we can see the answer alert
        setAnswerStatus(
            questionType === QuestionType.FREE_RESPONSE
                ? AnswerStatus.NEEDS_GRADED
                : evaluateAnswer(val.answer.toString()) === CorrectStatus.TRUE
                ? AnswerStatus.CORRECT
                : AnswerStatus.INCORRECT
        )

        //if we are doing free play, we'll use the createGameAnswer - else we will update our course with the course answer
        await (type === 'free'
            ? createGameAnswer
            : type === 'course'
            ? gradeCourseAnswer
            : gradeActivityAnswer)({
            ...val,
            answer: val.answer.toString(),
            isCorrect:
                questionType === QuestionType.FREE_RESPONSE
                    ? CorrectStatus.NEEDS_GRADED
                    : evaluateAnswer(val.answer.toString()),
            questionId: currentQuestion?.id,
            type: questionType,
        })
    }

    const disabled = { disabled: questionStatus === QuestionStatus.ANSWERED }

    return (
        <StyledDiv>
            {session && (
                <Form<IQuizForm>
                    form={form}
                    name={'answerForm'}
                    initialValues={{
                        answer: currentAnswer?.userAnswer?.answer,
                    }}
                    onFinish={async val => {
                        setQuestionStatus(QuestionStatus.ANSWERED)
                        await submitAnswer(val, currentQuestion?.type)
                    }}
                    layout={'vertical'}
                >
                    <Item
                        name={'answer'}
                        rules={[
                            {
                                required: true,
                                message:
                                    currentQuestion?.type ===
                                    QuestionType?.FREE_RESPONSE
                                        ? 'Please write a response!'
                                        : 'Please select an answer to continue',
                            },
                        ]}
                        label={<FormLabel label={'Answer'} />}
                    >
                        {session?.questions &&
                        currentQuestion?.type === QuestionType.FREE_RESPONSE ? (
                            <TextArea
                                placeholder={'Response...'}
                                {...disabled}
                            />
                        ) : currentQuestion?.type ===
                              QuestionType.SIMPLE_RESPONSE &&
                          currentQuestion?.simpleResponseType ? (
                            <SimpleAnswer
                                inputType={currentQuestion?.simpleResponseType}
                                value={value}
                                onChange={setValue}
                                {...disabled}
                            />
                        ) : (
                            <StyledGroup
                                name={session.id}
                                {...disabled}
                                options={session?.questions?.[
                                    session?.currentQuestion - 1
                                ]?.options?.map(option => ({
                                    value: option.answer,
                                    key: option.id,
                                    label: option.answer,
                                }))}
                            />
                        )}
                    </Item>
                </Form>
            )}
            <AnswerStatusAlert
                status={answerStatus}
                explanation={currentQuestion?.explanation}
                correctAnswer={currentQuestion?.correctAnswer}
            />
        </StyledDiv>
    )
}

export default QuizForm
