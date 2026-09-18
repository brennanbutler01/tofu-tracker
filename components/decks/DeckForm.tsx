import {
    Button,
    Card,
    Col,
    Form,
    Input,
    notification,
    Row,
    Space,
    Typography,
} from 'antd'
import FormLabel from '../FormLabel'
import { useDeckCRUD } from '@/services/decks/useDeckCRUD'
import React, { useEffect, useState } from 'react'
import DeckCategories from '@/decks/DeckCategories'
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { DeckWithQuestions } from '@/pages/decks/[id]'
import styled from 'styled-components'
import { useRouter } from 'next/router'

const { Item } = Form,
    { Title } = Typography

export interface IDeckForm {
    title: string
    tags?: string[]
}

interface DeckProps {
    editingDeck?: DeckWithQuestions
}

export const FormCardWrapper = styled.div`
        &&& {
            border: 1px solid ${props => props.theme['tofu-brand-5']};
            box-shadow: ${props => props.theme['tofu-box-shadow']};

            .ant-card-head {
                background-color: ${props => props.theme['tofu-brand-3']};
                border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
            }

            .ant-card-head-title .ant-typography {
                color: ${props => props.theme['tofu-text']};
                white-space: break-spaces;
            }

            .ant-input {
                border-radius: 2px;
            }
        }
    `,
    StyledClose = styled(CloseOutlined)`
        &:hover {
            color: ${props => props.theme['tofu-blood']} !important;
        }
    `

const DeckForm = ({ editingDeck }: DeckProps) => {
    const [form] = Form.useForm()
    const { createDeck, updateDeckWithQuestions } = useDeckCRUD()

    const [tags, setTags] = useState<Array<string>>([])
    const [loading, setLoading] = useState(false)
    const { push } = useRouter()

    useEffect(() => {
        if (editingDeck) {
            setTags(editingDeck?.tags)
        }
    }, [editingDeck])

    return (
        <FormCardWrapper>
            <Card
                bordered={false}
                title={
                    <Title level={4}>
                        {editingDeck ? 'Editing' : 'Create'} Deck{' '}
                    </Title>
                }
            >
                <Form<IDeckForm>
                    form={form}
                    layout={'vertical'}
                    name={'Deck Form'}
                    onFinish={async values => {
                        setLoading(true)
                        //if we are editing our deck, we should update our deck
                        if (editingDeck) {
                            // update deck
                            await updateDeckWithQuestions(values)
                        } else {
                            //else we will make a new deck
                            const newId = await createDeck(values)
                            notification.open({
                                message: 'Deck Created',
                                type: 'success',
                                description: `Click to add questions or edit deck ${values.title}`,
                                style: { cursor: 'pointer' },
                                duration: null,
                                onClick: async () => {
                                    await push(`/decks/${newId}`)
                                    notification.destroy()
                                },
                                closeIcon: <StyledClose />,
                            })
                        }
                        setLoading(false)
                        form.resetFields()
                    }}
                    {...(editingDeck && {
                        initialValues: {
                            ...editingDeck,
                        },
                    })}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Item
                                name={'title'}
                                label={<FormLabel label={'Title'} />}
                                tooltip={{
                                    icon: <QuestionCircleOutlined />,
                                    title: 'This title will be the name of the learning deck.',
                                }}
                                rules={[
                                    {
                                        min: 3,
                                        required: true,
                                        message:
                                            'Please enter a deck title that is at least three (3) characters long.',
                                    },
                                ]}
                            >
                                <Input placeholder={'Deck Title'} />
                            </Item>
                        </Col>
                        <Col span={24}>
                            <Item
                                name={'tags'}
                                label={<FormLabel label={'Categories'} />}
                                tooltip={{
                                    icon: <QuestionCircleOutlined />,
                                    title: "These are categories that describe the subjects and audience of the deck's learning materials.",
                                }}
                            >
                                <DeckCategories
                                    onChange={values => setTags(values)}
                                    value={tags}
                                    fullWidth
                                />
                            </Item>
                        </Col>
                        <Col span={24}>
                            <Space size={'large'}>
                                <Item>
                                    <Button
                                        type={'primary'}
                                        htmlType={'submit'}
                                        loading={loading}
                                    >
                                        {editingDeck ? 'Confirm' : 'Create'}
                                    </Button>
                                </Item>
                                <Item>
                                    <Button
                                        danger
                                        htmlType={'reset'}
                                        loading={loading}
                                    >
                                        Reset
                                    </Button>
                                </Item>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </FormCardWrapper>
    )
}

export default DeckForm
