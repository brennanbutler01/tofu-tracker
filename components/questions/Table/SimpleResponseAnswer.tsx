import { Button, Col, Form, Row, Skeleton, Space, Switch } from 'antd'
import FormLabel from '@/components/FormLabel'
import { ITableTabs } from '@/questions/Table/TableTabs'
import { SimpleAnswer } from '@/questions/SimpleAnswer'
import { useState } from 'react'
import { SwitchContainer } from '@/questions/QuestionForm'
import styled from 'styled-components'
import { useDeckQuestionCRUD } from '@/services/decks/questions/useDeckQuestionCRUD'
const { Item } = Form

interface ISimpleResponse {
    correctAnswer: string
}

export const DisabledInputContainer = styled.div`
    .ant-input[disabled] {
        color: rgba(232, 230, 227, 0.25);
        background-color: rgb(30, 32, 33);
        border-color: rgb(99, 92, 82);
        box-shadow: none;
    }
    .ant-input-number-disabled {
        color: rgba(232, 230, 227, 0.25);
        background-color: rgb(30, 32, 33);
        border-color: rgb(99, 92, 82);
        box-shadow: none;
    }
`

const SimpleResponseAnswer = ({ record }: ITableTabs) => {
    const [form] = Form.useForm<ISimpleResponse>()
    const [value, setValue] = useState<string | number>('')
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const { updateDeckQuestionCorrectAnswer } = useDeckQuestionCRUD()

    return (
        <Row>
            <Skeleton active loading={loading}>
                <Col span={24} sm={12} md={10} lg={8} xxl={4}>
                    <Form
                        form={form}
                        initialValues={{ correctAnswer: record.correctAnswer }}
                        layout={'vertical'}
                        onFinish={async val => {
                            setLoading(true)
                            await updateDeckQuestionCorrectAnswer({
                                id: record.id,
                                correctAnswer: val.correctAnswer.toString(),
                            })
                            setLoading(false)
                            setEditing(false)
                        }}
                    >
                        <DisabledInputContainer>
                            <Item
                                label={<FormLabel label={'Correct Answer'} />}
                                name={'correctAnswer'}
                            >
                                <SimpleAnswer
                                    inputType={
                                        record.simpleResponseType || 'TEXT'
                                    }
                                    value={value}
                                    onChange={setValue}
                                    disabled={!editing}
                                />
                            </Item>
                        </DisabledInputContainer>
                        <Item label={<FormLabel label={'Editing?'} />} colon>
                            <SwitchContainer>
                                <Switch
                                    size={'small'}
                                    checked={editing}
                                    onChange={() => setEditing(!editing)}
                                />
                            </SwitchContainer>
                        </Item>
                        {editing && (
                            <Space>
                                <Item>
                                    <Button
                                        htmlType={'submit'}
                                        type={'primary'}
                                    >
                                        Confirm
                                    </Button>
                                </Item>
                                <Item>
                                    <Button
                                        danger
                                        onClick={() => setEditing(false)}
                                    >
                                        Cancel{' '}
                                    </Button>
                                </Item>
                            </Space>
                        )}
                    </Form>
                </Col>
            </Skeleton>
        </Row>
    )
}

export default SimpleResponseAnswer
