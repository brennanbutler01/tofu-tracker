import { Card, Form, Typography } from 'antd'
import styled from 'styled-components'
import QuizForm from '@/components/game/QuizForm'
import { useState } from 'react'
import useQuizCardActions from '@/components/game/useQuizCardActions'
import QuestionRating from '@/components/game/QuestionRating'
import GameCardTabs from '@/components/game/GameCardTabs'
import { QuizProps } from '@/components/game/Quiz'
import { AnswerStatus } from '@/components/game/AnswerStatusAlert'
import { useGameTypeData } from '@/services/useGameTypeData'

const { Title } = Typography,
    { Meta } = Card

export const StyledCard = styled(Card)`
        border: 1px solid ${({ theme }) => theme['tofu-brand-5']};

        .ant-card-head-wrapper {
            align-content: start;
            flex-direction: column;
            justify-content: space-between;
        }

        .ant-card-head-title {
            width: 100%;
            white-space: break-spaces;
        }

        .ant-card-extra {
            width: 100%;
        }

        .ant-card-head {
            background-color: ${({ theme }) => theme['tofu-brand-3']};
            border-bottom: 1px solid ${({ theme }) => theme['tofu-brand-5']};
        }
        .ant-card-body {
            background-color: ${({ theme }) => theme['tofu-brand-2']};
        }

        .ant-card-type-inner .ant-card-body {
            background-color: ${props => props.theme['tofu-brand-3']};
        }
        //update card borders
        border-color: ${props => props.theme['tofu-brand-4']};
        margin-bottom: 3vh;

        .ant-card-actions {
            background-color: ${({ theme }) => theme['tofu-brand-3']};
            border-top: 1px solid ${({ theme }) => theme['tofu-brand-5']};
        }

        .ant-card-actions > li:not(:last-child) {
            border-right: 1px solid ${({ theme }) => theme['tofu-brand-5']};
        }

        .ant-radio-input:focus + .ant-radio-inner {
            box-shadow: 0 0 0 2px ${props => props.theme['tofu-brand-4']};
        }

        .ant-radio-disabled .ant-radio-inner::after {
            background-color: ${props => props.theme['tofu-green']};
        }
        .ant-radio-disabled .ant-radio-inner {
            background-color: ${props => props.theme['tofu-brand-0']};
            border-color: rgb(99, 92, 82) !important;
        }
        .ant-typography-expand,
        .ant-typography-edit,
        .ant-typography-copy {
            color: ${props => props.theme['tofu-brand-7']};

            :hover {
                color: ${props => props.theme['tofu-button-green']};
            }
        }
        .ant-image-wrapper {
            display: flex;
        }
    `,
    StyledMeta = styled(Meta)`
        &&& {
            .ant-card-meta-detail {
                width: 100%;
            }
        }
    `,
    CardWrapper = styled.div`
        &&& {
        }
    `

export enum QuestionStatus {
    ANSWERED,
    WAITING,
}

const QuizCard = ({ type = 'free' }: QuizProps) => {
    const session = useGameTypeData({ type })
    const [questionStatus, setQuestionStatus] = useState<QuestionStatus>(
        QuestionStatus.WAITING
    )
    const [answerStatus, setAnswerStatus] = useState<AnswerStatus>(
        AnswerStatus.BLANK
    )

    const [viewFeedback, setViewFeedback] = useState(false)
    const [feedbackQuestionId, setFeedbackQuestionId] = useState<
        string | undefined
    >(undefined)

    const current = session?.questions?.[session?.currentQuestion - 1]

    const [form] = Form.useForm()
    const quizCardActions = useQuizCardActions({
        questionStatus,
        setQuestionStatus,
        viewFeedback,
        setViewFeedback,
        setFeedbackQuestionId,
        setAnswerStatus,
        answerStatus,
        form,
        type,
    })

    console.log('form values', form.getFieldsValue())

    return (
        <CardWrapper>
            <StyledCard
                title={<Title level={3}>{current?.question}</Title>}
                // extra={<QuestionRating questionId={current?.id} />}
                actions={quizCardActions}
                loading={!session}
            >
                <StyledMeta
                    description={
                        <div style={{ padding: '8px' }}>
                            <QuizForm
                                setQuestionStatus={setQuestionStatus}
                                questionStatus={questionStatus}
                                answerStatus={answerStatus}
                                setAnswerStatus={setAnswerStatus}
                                form={form}
                                type={type}
                            />
                            {viewFeedback && feedbackQuestionId && (
                                <GameCardTabs
                                    feedbackQuestionId={feedbackQuestionId}
                                    type={type}
                                />
                            )}
                        </div>
                    }
                />
            </StyledCard>
        </CardWrapper>
    )
}

export default QuizCard
