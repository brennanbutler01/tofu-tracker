import { Button, Col, Form, Input, Row, Skeleton } from 'antd'
import FormLabel from '@/components/FormLabel'
import ResourceTags, {
    TagsType,
} from '@/components/game/resources/ResourceTags'
import { useContext, useRef, useState } from 'react'
import { useGradingSessionCRUD } from '@/services/gradingSession/useGradingSessionCRUD'
import { IGradingTabs } from '@/components/admin/GradingTabs'
import { StyledCard } from '@/components/game/QuizCard'
import { GradingContext } from '@/pages/admin/grade/[id]'

const { Item } = Form,
    { TextArea } = Input

export interface IGradingResourceForm {
    title: string
    location: string
    description: string
    tags: Array<string>
}

const GradingResourceForm = ({ next, loading, setLoading }: IGradingTabs) => {
    const [value, setValue] = useState<TagsType>([])
    const titleRef = useRef<any>(null)
    const [form] = Form.useForm<IGradingResourceForm>()
    const { createGradingResource } = useGradingSessionCRUD()
    const current = useContext(GradingContext)

    return (
        <StyledCard
            type={'inner'}
            actions={[
                <Button
                    loading={loading}
                    htmlType={'reset'}
                    danger
                    key={'reset'}
                    form={'grading-resource-form'}
                >
                    Reset
                </Button>,
                <Button
                    loading={loading}
                    htmlType={'submit'}
                    key={'create'}
                    aria-label='Create resource'
                    form={'grading-resource-form'}
                >
                    Create
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout={'vertical'}
                name={'grading-resource-form'}
                onFinish={async val => {
                    setLoading(true)
                    const saved = await createGradingResource({
                        tags: val.tags,
                        location: val.location,
                        title: val.title,
                        description: val.description,
                        gameAnswerId: current?.id as string,
                        critiqueId: current?.critiqueId as string,
                    })
                    setLoading(false)
                    if (saved) {
                        form.resetFields()
                        next()
                    }
                }}
            >
                <Skeleton active loading={loading}>
                    <Row>
                        <Col span={16}>
                            <Item
                                label={<FormLabel label={'Title'} />}
                                name={'title'}
                            >
                                <Input
                                    placeholder={'Resource Title'}
                                    ref={titleRef}
                                />
                            </Item>
                        </Col>
                        <Col span={16}>
                            <Item
                                label={<FormLabel label={'Location'} />}
                                name={'location'}
                            >
                                <Input placeholder={'Resource url'} />
                            </Item>
                        </Col>
                        <Col span={24}>
                            <Item
                                label={<FormLabel label={'Description'} />}
                                name={'description'}
                            >
                                <TextArea
                                    placeholder={'Resource Description'}
                                />
                            </Item>
                        </Col>
                        <Col span={24}>
                            <Item
                                label={<FormLabel label={'Tags'} />}
                                name={'tags'}
                            >
                                <ResourceTags
                                    value={value}
                                    onChange={setValue}
                                />
                            </Item>
                        </Col>
                    </Row>
                </Skeleton>
            </Form>
        </StyledCard>
    )
}
export default GradingResourceForm
