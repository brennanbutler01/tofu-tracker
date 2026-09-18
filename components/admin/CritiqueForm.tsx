import { Button, Col, Form, Input, Row, Skeleton } from 'antd'
import FormLabel from '@/components/FormLabel'
import { useGradingSessionCRUD } from '@/services/gradingSession/useGradingSessionCRUD'
import { SolutionOutlined } from '@ant-design/icons'
import { IGradingTabs } from '@/components/admin/GradingTabs'
import { useContext, useEffect } from 'react'
import { StyledCard } from '@/components/game/QuizCard'
import { GradingContext } from '@/pages/admin/grade/[id]'

const { Item } = Form,
    { TextArea } = Input

interface ICritiqueForm {
    critique: string
}

const CritiqueForm = ({ next, setLoading, loading }: IGradingTabs) => {
    const [form] = Form.useForm<ICritiqueForm>()
    const current = useContext(GradingContext)
    const { createCritique } = useGradingSessionCRUD()

    useEffect(() => {
        form.setFieldsValue({
            critique: current?.critique?.critique,
        })
    }, [current, form])

    return (
        <StyledCard
            type={'inner'}
            actions={[
                <Button
                    key={'critiqueBtn'}
                    size={'large'}
                    type={'dashed'}
                    htmlType={'submit'}
                    icon={<SolutionOutlined />}
                    form={'critique-form'}
                    block
                    loading={loading}
                >
                    {current?.critique ? 'Edit ' : 'Add '} Critique
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout={'vertical'}
                name={'critique-form'}
                onFinish={async val => {
                    setLoading(true)
                    await createCritique({
                        critique: val.critique,
                        gameAnswerId: current?.id as string,
                        userAnswerId: current?.userAnswer?.id as string,
                    })
                    setLoading(false)
                }}
            >
                <Row>
                    <Col span={24}>
                        <Item label={<FormLabel label={'Critique'} />}>
                            <Skeleton active loading={loading}>
                                <Item noStyle name={'critique'}>
                                    <TextArea
                                        placeholder={'Critique'}
                                        autoSize
                                    />
                                </Item>
                            </Skeleton>
                        </Item>
                    </Col>
                </Row>
            </Form>
        </StyledCard>
    )
}

export default CritiqueForm
