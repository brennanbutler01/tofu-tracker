import { Button, Col, Form, Input, Radio, Row, Skeleton } from 'antd'
import { CorrectStatus } from '@prisma/client'
import FormLabel from '@/components/FormLabel'
import styled from 'styled-components'
import React, { useContext, useEffect } from 'react'
import { useGradingSessionCRUD } from '@/services/gradingSession/useGradingSessionCRUD'
import { StyledCard } from '@/components/game/QuizCard'
import { HighlightOutlined } from '@ant-design/icons'
import { IGradingTabs } from '@/components/admin/GradingTabs'
import { GradingContext } from '@/pages/admin/grade/[id]'

//TODO - swap over to popping off our most recent graded question

const { Item } = Form,
    { Group } = Radio,
    { TextArea } = Input

const correctOptions = [
    { label: 'Correct', value: CorrectStatus.TRUE },
    { label: 'False', value: CorrectStatus.FALSE },
]

const FormContent = styled.div`
    .ant-input[disabled] {
        color: rgba(232, 230, 227, 0.25);
        background-color: rgb(30, 32, 33);
        border-color: rgb(99, 92, 82);
        box-shadow: none;
    }
    .ant-radio-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
`

interface IFreeGrade {
    userAnswer: string
    isCorrect: CorrectStatus
}

const FreeGradingForm = ({ loading, setLoading, next }: IGradingTabs) => {
    const current = useContext(GradingContext)
    const [form] = Form.useForm<IFreeGrade>()
    const { gradeAnswer } = useGradingSessionCRUD()

    useEffect(() => {
        form.setFieldsValue({
            isCorrect:
                //if we already have graded & it is true, return the grade
                current?.isCorrect === CorrectStatus.NEEDS_GRADED ||
                current?.isCorrect === CorrectStatus.FALSE
                    ? CorrectStatus.FALSE
                    : CorrectStatus.TRUE,
            //else just do false
            userAnswer: current?.userAnswer?.answer,
        })
    }, [form, current])

    return (
        <StyledCard
            type={'inner'}
            actions={[
                <Button
                    size={'large'}
                    block
                    type={'dashed'}
                    icon={<HighlightOutlined />}
                    htmlType={'submit'}
                    loading={loading}
                    key={'gradeBtn'}
                    form={'free-form'}
                >
                    {current?.isCorrect !== CorrectStatus.NEEDS_GRADED
                        ? 'Edit '
                        : ''}
                    Grade
                </Button>,
            ]}
        >
            <Form
                form={form}
                name={'free-form'}
                layout={'vertical'}
                onFinish={async val => {
                    setLoading(true)
                    await gradeAnswer({
                        isCorrect: val.isCorrect,
                        gameAnswerId: current?.id as string,
                    })
                    setLoading(false)
                }}
            >
                <FormContent>
                    <Row gutter={48}>
                        <Col span={24}>
                            <Item
                                name={'userAnswer'}
                                label={<FormLabel label={'Answer'} />}
                            >
                                <TextArea disabled autoSize />
                            </Item>
                        </Col>

                        <Col span={16}>
                            <Item label={<FormLabel label={'Is Correct?'} />}>
                                <Skeleton active loading={loading}>
                                    <Item noStyle name={'isCorrect'}>
                                        <Group
                                            options={correctOptions}
                                            name={'isCorrect'}
                                        />
                                    </Item>
                                </Skeleton>
                            </Item>
                        </Col>
                    </Row>
                </FormContent>
            </Form>
        </StyledCard>
    )
}
export default FreeGradingForm
