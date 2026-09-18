import { Badge, Col, Form, Input, Radio, Row, Space, Switch } from 'antd'
import React, { useEffect, useState } from 'react'
import FormLabel from '@/components/FormLabel'
import { IQuestionForm, SwitchContainer } from '@/questions/QuestionForm'
import { useDeckQuestionCRUD } from '@/services/decks/questions/useDeckQuestionCRUD'
import { CheckCircleTwoTone, QuestionCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import FadeIn from 'react-fade-in'

const { Item } = Form

export const CORRECT_ANSWER_FORM = 'CorrectAnswerForm'

interface IAnswerForm {
    editing: string | undefined
    values: IQuestionForm
    onClose: () => void
}

export interface AnswerFormFields {
    correctAnswer: string
    explanation: string
}

const AnswerRadioGroup = styled(Radio.Group)`
        display: flex;
        flex-direction: column;
        gap: 5px;

        .ant-radio-input:focus + .ant-radio-inner {
            box-shadow: 0 0 0 2px ${props => props.theme['tofu-brand-4']};
        }
    `,
    HelpContainer = styled.div`
        margin-top: 5px;
    `

const AnswerForm = ({ editing, onClose, values }: IAnswerForm) => {
    const { updateDeckQuestionCorrectAnswer } = useDeckQuestionCRUD()
    const [showExplanation, setShowExplanation] = useState(false)
    const toggleExplanation = () => setShowExplanation(!showExplanation)

    const currentAnswer = <CheckCircleTwoTone twoToneColor={'#52c41a'} />

    const answerOptions = values.options.map(answer => ({
        value: answer.text,
        label:
            editing && answer.text === values.correctAnswer ? (
                <Badge
                    count={<CheckCircleTwoTone twoToneColor={'#52c41a'} />}
                    offset={[8, 0]}
                >
                    {answer.text}
                </Badge>
            ) : (
                answer.text
            ),
    }))

    return (
        <Form<AnswerFormFields>
            name={'CorrectAnswerForm'}
            layout={'vertical'}
            initialValues={{ correctAnswer: values.correctAnswer }}
            onFinish={async formValues => {
                if (editing) {
                    const saved = await updateDeckQuestionCorrectAnswer({
                        id: editing,
                        ...formValues,
                    })
                    if (saved) onClose()
                }
            }}
        >
            <Row gutter={24}>
                <Space
                    direction={'vertical'}
                    size={'large'}
                    style={{ width: '100%' }}
                >
                    <Col span={24}>
                        <Item
                            name={'correctAnswer'}
                            label={<FormLabel label={'Correct Answer?'} />}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Please identify a correct answer.',
                                },
                            ]}
                            help={
                                editing && (
                                    <HelpContainer>
                                        {currentAnswer} denotes our currently
                                        selected answer for this question.
                                    </HelpContainer>
                                )
                            }
                        >
                            <AnswerRadioGroup options={answerOptions} />
                        </Item>
                    </Col>
                    <Col span={16}>
                        <SwitchContainer>
                            <Item
                                label={
                                    <FormLabel label={'Show Explanation?'} />
                                }
                            >
                                <Switch onChange={toggleExplanation} />
                            </Item>
                        </SwitchContainer>
                    </Col>
                </Space>
                {showExplanation && (
                    <FadeIn>
                        <Col span={24}>
                            <Item
                                name={'explanation'}
                                label={<FormLabel label={'Explanation'} />}
                                help={
                                    'An optional explanation of the correct answer.'
                                }
                                tooltip={{
                                    icon: <QuestionCircleOutlined />,
                                    title: 'This message will be displayed when the user completes answering a question. This can be used to give some extra info.',
                                }}
                            >
                                <Input.TextArea
                                    placeholder={'Correct answer explanation'}
                                />
                            </Item>
                        </Col>
                    </FadeIn>
                )}
            </Row>
        </Form>
    )
}

export default AnswerForm
