import { ITableTabs } from '@/questions/Table/TableTabs'
import { Button, Col, Form, Input, Row, Skeleton, Space, Switch } from 'antd'
import FormLabel from '@/components/FormLabel'
import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import FadeIn from 'react-fade-in'
import { useDeckQuestionCRUD } from '@/services/decks/questions/useDeckQuestionCRUD'
import { SwitchContainer } from '@/questions/QuestionForm'
const { Item } = Form,
    { TextArea } = Input

const FormWrapper = styled.div`
    &&& {
        .ant-input[disabled] {
            background-color: ${props => props.theme['tofu-brand-1']};
            color: ${props => props.theme['tofu-text-secondary']};
        }
        .ant-input {
            background-color: ${props => props.theme['tofu-brand-4']};
        }
    }
`

interface IFreeResponseForm {
    correctAnswer: string
}

const FreeResponseAnswer = ({ record }: ITableTabs) => {
    const [editing, setEditing] = useState(false)

    const toggleEditing = () => setEditing(!editing)
    const correctRef = useRef<any>(null)

    const { updateDeckQuestionCorrectAnswer } = useDeckQuestionCRUD()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (editing) correctRef?.current?.focus({ cursor: 'all' })
    }, [editing])

    return (
        <Form<IFreeResponseForm>
            layout={'vertical'}
            initialValues={{ correctAnswer: record.correctAnswer }}
            onFinish={async val => {
                setLoading(true)
                await updateDeckQuestionCorrectAnswer({
                    id: record.id,
                    correctAnswer: val.correctAnswer,
                })
                setLoading(false)
            }}
        >
            <FormWrapper>
                <Skeleton active loading={loading}>
                    <Row align={'middle'} justify={'space-between'} gutter={48}>
                        <Col span={16}>
                            <Item
                                name={'correctAnswer'}
                                label={<FormLabel label={'Correct Answer'} />}
                            >
                                <TextArea
                                    disabled={!editing}
                                    ref={correctRef}
                                />
                            </Item>
                        </Col>
                        <Col span={16}>
                            <Item
                                label={<FormLabel label={'Editing?'} />}
                                colon
                                style={{
                                    marginBottom: 0,
                                    flexDirection: 'row',
                                    gap: '1vw',
                                }}
                            >
                                <SwitchContainer style={{ paddingBottom: 8 }}>
                                    <Switch
                                        onChange={toggleEditing}
                                        checked={editing}
                                        size={'small'}
                                    />
                                </SwitchContainer>
                            </Item>
                        </Col>
                    </Row>
                </Skeleton>
                <Col span={12} style={{ marginTop: '2vh' }}>
                    {editing && (
                        <FadeIn>
                            <Space size={'large'}>
                                <Item>
                                    <Button
                                        loading={loading}
                                        type={'primary'}
                                        htmlType={'submit'}
                                    >
                                        Confirm
                                    </Button>
                                </Item>
                                <Item>
                                    <Button
                                        loading={loading}
                                        danger
                                        onClick={() => setEditing(false)}
                                        htmlType={'reset'}
                                    >
                                        Cancel
                                    </Button>
                                </Item>
                            </Space>
                        </FadeIn>
                    )}
                </Col>
            </FormWrapper>
        </Form>
    )
}

export default FreeResponseAnswer
