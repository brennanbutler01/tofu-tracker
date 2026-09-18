import DeleteItem from '@/components/DeleteItem'
import { StyledCard } from '@/components/game/QuizCard'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import { useDeckQuestionCRUD } from '@/services/decks/questions/useDeckQuestionCRUD'
import { Models } from '@/utils/message.utils'
import { EditOutlined } from '@ant-design/icons'
import { Space, List, Col, Button, Card, Input, Form } from 'antd'
import { useState } from 'react'
import styled from 'styled-components'
import { renderTag } from './QuestionTag'
import TableTabs from './TableTabs'
const { Item } = List,
    { Meta } = Card,
    { TextArea } = Input

const StyledContainer = styled.div`
    &&& {
        .ant-card-meta-title {
            white-space: normal;
        }

        .ant-card-extra {
            padding: 0 0 16px;
        }

        .ant-btn {
            width: 100%;
        }
    }
`

interface IQuestionListItem {
    item: QuestionWithOptions
    index: number
}

interface IQuestionForm {
    question: string
}

export const QuestionListItem = ({ item, index }: IQuestionListItem) => {
    const { deleteDeckQuestion, updateDeckQuestion } = useDeckQuestionCRUD()
    const [showExtra, setShowExtra] = useState(false)
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    return (
        <Item key={item.id}>
            <StyledContainer>
                <StyledCard
                    loading={loading}
                    title={`Question ${index + 1}`}
                    extra={renderTag({ type: item.type })}
                    actions={[
                        <EditOutlined
                            onClick={() => setEditing(true)}
                            key='edit'
                        />,
                        <DeleteItem
                            key='delete'
                            model={Models.QUESTION}
                            onDelete={async () =>
                                await deleteDeckQuestion(item)
                            }
                        />,
                    ]}
                >
                    <Meta
                        title={
                            editing ? (
                                <Form<IQuestionForm>
                                    initialValues={{ question: item.question }}
                                    name='questionForm'
                                    onFinish={async val => {
                                        setLoading(true)
                                        await updateDeckQuestion({
                                            id: item.id,
                                            type: item.type,
                                            question: val.question,
                                        })
                                        setLoading(false)
                                        setEditing(false)
                                    }}
                                >
                                    <Form.Item name='question'>
                                        <TextArea rows={4} />
                                    </Form.Item>
                                </Form>
                            ) : (
                                item.question
                            )
                        }
                        description={
                            editing ? (
                                <Space>
                                    <Button
                                        htmlType='submit'
                                        type='primary'
                                        form='questionForm'
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        danger
                                        onClick={() => setEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                </Space>
                            ) : (
                                <Space
                                    style={{ width: '100%' }}
                                    direction='vertical'
                                >
                                    {showExtra && (
                                        <Col span={24}>
                                            <TableTabs record={item} />
                                        </Col>
                                    )}
                                    <Button
                                        type='dashed'
                                        onClick={() => setShowExtra(!showExtra)}
                                    >
                                        {showExtra ? 'Hide' : 'Show'} Extra
                                    </Button>
                                </Space>
                            )
                        }
                    />
                </StyledCard>
            </StyledContainer>
        </Item>
    )
}
