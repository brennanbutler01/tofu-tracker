import { Button, Col, Form, Input, Row, Space } from 'antd'
import FormLabel from '@/components/FormLabel'
import ResourceTags, {
    TagsType,
} from '@/components/game/resources/ResourceTags'
import { useEffect, useRef, useState } from 'react'
import { useFeedbackCRUD } from '@/services/feedback/useFeedbackCRUD'
import { useRouter } from 'next/router'
import { useGamesSWR } from '@/services/games/useGamesSWR'
import { StyledCard } from '@/components/game/QuizCard'
import { QuizProps } from '../Quiz'
import { useGameTypeData } from '@/services/useGameTypeData'

const { Item } = Form,
    { TextArea } = Input

export interface IResourceForm {
    location: string
    description: string
    title: string
}

interface IFormProps extends QuizProps {
    visible: boolean
}

const FeedbackResourceForm = ({ visible, type }: IFormProps) => {
    const [value, setValue] = useState<TagsType>([])

    const session = useGameTypeData({ type })

    const { createQuestionResource } = useFeedbackCRUD(
        session?.questions?.[session?.currentQuestion - 1]?.id
    )
    const titleRef = useRef<any>(null)
    const [form] = Form.useForm<IResourceForm>()

    useEffect(() => {
        titleRef?.current?.focus()
    }, [visible])

    return (
        <StyledCard bordered={false} type={'inner'}>
            <Form
                form={form}
                layout={'vertical'}
                onFinish={async val => {
                    await createQuestionResource(val)
                    form.resetFields()
                }}
            >
                <Row gutter={16}>
                    <Col span={24} sm={16} md={12}>
                        <Item
                            label={<FormLabel label={'Title'} />}
                            name={'title'}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Please enter a title for this resource.',
                                },
                            ]}
                        >
                            <Input
                                placeholder={'Resource Title'}
                                ref={titleRef}
                            />
                        </Item>
                    </Col>
                    <Col span={24} sm={16} md={12}>
                        <Item
                            label={<FormLabel label={'Location'} />}
                            name={'location'}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Please enter a url/location for this resource.',
                                },
                            ]}
                        >
                            <Input placeholder={'Resource url'} />
                        </Item>
                    </Col>
                    <Col span={24} sm={16} md={24}>
                        <Item
                            label={<FormLabel label={'Description'} />}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Please enter a description for this resource',
                                },
                            ]}
                            name={'description'}
                        >
                            <TextArea placeholder={'Resource Description'} />
                        </Item>
                    </Col>
                    <Col span={24} sm={16} md={24}>
                        <Item
                            label={<FormLabel label={'Tags'} />}
                            name={'tags'}
                        >
                            <ResourceTags value={value} onChange={setValue} />
                        </Item>
                    </Col>
                    <Col span={24}>
                        <Space size={'large'}>
                            <Item>
                                <Button htmlType={'reset'} danger>
                                    Reset
                                </Button>
                            </Item>
                            <Item>
                                <Button htmlType={'submit'} type={'primary'}>
                                    Create
                                </Button>
                            </Item>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </StyledCard>
    )
}

export default FeedbackResourceForm
