import {
    Button,
    CheckboxOptionType,
    Col,
    Form,
    Input,
    Radio,
    Row,
    Space,
    Switch,
} from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { QuestionType, SimpleResponseInputTypes } from '@prisma/client'
import QuestionTypes, { GroupContainer } from '@/questions/QuestionTypes'
import FormLabel from '@/components/FormLabel'
import {
    MinusCircleOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import FadeIn from 'react-fade-in'
import { useDeckQuestionCRUD } from '@/services/decks/questions/useDeckQuestionCRUD'
import { SimpleAnswer } from './SimpleAnswer'
const { Item } = Form

export type OptionValue = { text: string }

export interface OptionsFormValue {
    options: Array<OptionValue>
}

export interface IQuestionForm extends OptionsFormValue {
    type: QuestionType
    question: string
    correctAnswer: string | number
    explanation?: string
    simpleResponseInputType?: SimpleResponseInputTypes
}

const AnswerRadioGroup = styled(Radio.Group)`
        display: flex;
        flex-direction: column;
        gap: 5px;

        &&& {
            .ant-radio-input:focus + .ant-radio-inner {
                box-shadow: 0 0 0 2px ${props => props.theme['tofu-brand-4']};
            }
        }
    `,
    FormSpace = styled(Space)`
        width: 100%;
        .ant-radio-button-wrapper:focus-within {
            box-shadow: 0 0 0 3px ${props => props.theme['tofu-brand-4']};
        }
    `

export const SwitchContainer = styled.div`
    &&& {
        .ant-switch-checked:focus {
            box-shadow: 0 0 0 2px ${props => props.theme['tofu-brand-5']};
        }
    }
`

const QuestionForm = () => {
    const [form] = Form.useForm<IQuestionForm>()
    const [questionType, setQuestionType] = useState<QuestionType>(
        QuestionType.TRUE_FALSE
    )

    const [addExplanation, setAddExplanation] = useState(false)

    const toggleExplanation = () => setAddExplanation(!addExplanation)

    const options: Array<OptionValue> = Form.useWatch('options', form)
    const formQuestionType = Form.useWatch('type', form)
    const { createDeckQuestion } = useDeckQuestionCRUD()
    const [loading, setLoading] = useState(false)
    const simpleResponseInputType = Form.useWatch(
        'simpleResponseInputType',
        form
    )
    const [simpleResponseValue, setSimpleResponseValue] = useState<
        string | number
    >('')

    const questionRef = useRef<any>(null)
    const initFields = useCallback(() => {
        //use this to init our options fields and provide an initial value for correctAnswer. better user experience.
        if (formQuestionType === QuestionType.TRUE_FALSE) {
            form.setFieldsValue({
                options: [{ text: 'true' }, { text: 'false' }],
                correctAnswer: 'true',
            })
        } else if (formQuestionType === QuestionType.MULTIPLE_CHOICE) {
            form.setFieldsValue({
                options: [{ text: 'Option 1' }, { text: 'Option 2' }],
                correctAnswer: 'Option 1',
            })
            questionRef?.current?.focus()
        }
    }, [formQuestionType, form, questionRef])

    useEffect(() => {
        initFields()
    }, [form, formQuestionType, initFields])

    useEffect(() => {
        //focus the question when we render.
        questionRef?.current?.focus()
    }, [])

    useEffect(() => {
        if (formQuestionType === QuestionType.SIMPLE_RESPONSE) {
            form.setFieldsValue({
                correctAnswer:
                    simpleResponseInputType === SimpleResponseInputTypes.NUMBER
                        ? 0
                        : simpleResponseInputType ===
                          SimpleResponseInputTypes.CURRENCY
                        ? '1000'
                        : '',
            })
        }
    }, [form, simpleResponseInputType, formQuestionType])

    const submitForm = async (val: IQuestionForm) => {
        setLoading(true)
        const saved = await createDeckQuestion(val)
        setLoading(false)
        if (!saved) return
        form.resetFields()
        setTimeout(() => {
            questionRef.current.focus()
        }, 250)
        initFields()
    }

    return (
        <>
            <Form
                form={form}
                initialValues={{ type: QuestionType.TRUE_FALSE }}
                layout={'vertical'}
                name={'Question Form'}
                onFinish={submitForm}
                onReset={() => setAddExplanation(false)}
            >
                <FormSpace direction={'vertical'} size={'large'}>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Item
                                name={'type'}
                                label={<FormLabel label={'Question Type'} />}
                                tooltip={{
                                    icon: <QuestionCircleOutlined />,
                                    title: 'Should the question be formatted as a true or false or multiple choice question?',
                                }}
                                required
                            >
                                <QuestionTypes
                                    value={questionType}
                                    onChange={({ target: { value } }) =>
                                        setQuestionType(value)
                                    }
                                />
                            </Item>
                        </Col>
                        <Col span={24}>
                            <Item
                                name={'question'}
                                label={<FormLabel label={'Question'} />}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please add a question.',
                                        min: 5,
                                    },
                                ]}
                                tooltip={{
                                    icon: <QuestionCircleOutlined />,
                                    title: 'How the question will be displayed to users.',
                                }}
                            >
                                <Input
                                    placeholder={'Question'}
                                    ref={questionRef}
                                />
                            </Item>
                        </Col>
                        {formQuestionType !== QuestionType.FREE_RESPONSE &&
                            formQuestionType !==
                                QuestionType.SIMPLE_RESPONSE && (
                                <Col span={12} xs={24}>
                                    <Item
                                        label={<FormLabel label={'Options'} />}
                                    >
                                        <Form.List
                                            name='options'
                                            initialValue={[
                                                { text: null },
                                                { text: null },
                                            ]}
                                        >
                                            {(fields, { add, remove }) => (
                                                <>
                                                    {fields.map(
                                                        ({
                                                            key,
                                                            name,
                                                            ...restField
                                                        }) => (
                                                            <Space
                                                                key={key}
                                                                style={{
                                                                    display:
                                                                        'flex',
                                                                    marginBottom: 8,
                                                                }}
                                                                align='baseline'
                                                            >
                                                                <Item
                                                                    {...restField}
                                                                    name={[
                                                                        name,
                                                                        'text',
                                                                    ]}
                                                                >
                                                                    <Input placeholder='Option Text' />
                                                                </Item>
                                                                {/*{(editing ? index >= 0 : index > 1) && (*/}
                                                                <MinusCircleOutlined
                                                                    onClick={() =>
                                                                        remove(
                                                                            name
                                                                        )
                                                                    }
                                                                />
                                                                {/*)}*/}
                                                            </Space>
                                                        )
                                                    )}
                                                    <Item>
                                                        <Button
                                                            type='dashed'
                                                            onClick={() =>
                                                                add()
                                                            }
                                                            icon={
                                                                <PlusOutlined />
                                                            }
                                                        >
                                                            Add Option
                                                        </Button>
                                                    </Item>
                                                </>
                                            )}
                                        </Form.List>
                                    </Item>
                                </Col>
                            )}
                        {formQuestionType === QuestionType.SIMPLE_RESPONSE && (
                            <Col span={24}>
                                <GroupContainer>
                                    <Item
                                        name='simpleResponseInputType'
                                        label={
                                            <FormLabel label='Simple Response Input' />
                                        }
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please select a response type',
                                            },
                                        ]}
                                    >
                                        <Radio.Group
                                            buttonStyle='outline'
                                            options={[
                                                {
                                                    label: 'Currency',
                                                    value: SimpleResponseInputTypes.CURRENCY,
                                                },
                                                {
                                                    label: 'Number',
                                                    value: SimpleResponseInputTypes.NUMBER,
                                                },
                                                {
                                                    label: 'Text',
                                                    value: SimpleResponseInputTypes.TEXT,
                                                },
                                            ]}
                                            optionType='button'
                                        />
                                    </Item>
                                </GroupContainer>
                            </Col>
                        )}
                        <Col span={12} xs={24}>
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
                            >
                                {formQuestionType === QuestionType.TRUE_FALSE ||
                                formQuestionType ===
                                    QuestionType.MULTIPLE_CHOICE ? (
                                    <AnswerRadioGroup
                                        options={options?.reduce(
                                            (acc, curr) => {
                                                if (curr?.text) {
                                                    return [
                                                        ...acc,
                                                        {
                                                            value: curr.text,
                                                            label: curr.text,
                                                        },
                                                    ]
                                                }
                                                return acc
                                            },
                                            [] as Array<CheckboxOptionType>
                                        )}
                                    />
                                ) : formQuestionType ===
                                  QuestionType.FREE_RESPONSE ? (
                                    <Input.TextArea
                                        placeholder={'Correct answer'}
                                    />
                                ) : (
                                    <SimpleAnswer
                                        value={simpleResponseValue}
                                        onChange={setSimpleResponseValue}
                                        inputType={simpleResponseInputType}
                                    />
                                )}
                            </Item>
                        </Col>
                        <Space
                            direction={'vertical'}
                            style={{ width: '100%' }}
                            size={'large'}
                        >
                            <Col span={16} xs={24}>
                                <Space style={{ width: '100%' }}>
                                    <FormLabel label={'Show Explanation?'} />
                                    <SwitchContainer>
                                        <Switch
                                            onChange={toggleExplanation}
                                            defaultChecked={false}
                                        />
                                    </SwitchContainer>
                                </Space>
                            </Col>
                            <Col span={16} xs={24}>
                                {addExplanation && (
                                    <FadeIn>
                                        <Item
                                            name={'explanation'}
                                            label={
                                                <FormLabel
                                                    label={'Explanation'}
                                                />
                                            }
                                            help={
                                                'An optional explanation of the correct answer.'
                                            }
                                            tooltip={{
                                                icon: (
                                                    <QuestionCircleOutlined />
                                                ),
                                                title: 'This message will be displayed when the user completes answering a question. This can be used to give some extra info.',
                                            }}
                                        >
                                            <Input.TextArea
                                                placeholder={'Explanation'}
                                            />
                                        </Item>
                                    </FadeIn>
                                )}
                            </Col>
                        </Space>
                    </Row>
                    <Space size={'large'}>
                        <Item>
                            <Button
                                // block={breakpoint.xs}
                                loading={loading}
                                type={'primary'}
                                htmlType={'submit'}
                                aria-label='Create question'
                            >
                                Create
                            </Button>
                        </Item>
                        <Item>
                            <Button
                                // block={breakpoint.xs}
                                loading={loading}
                                danger
                                htmlType={'reset'}
                            >
                                Cancel
                            </Button>
                        </Item>
                    </Space>
                </FormSpace>
            </Form>
        </>
    )
}

export default QuestionForm
