import { useActivityCRUD } from '@/services/activities/useActivityCRUD'
import useSingleActivitySWR from '@/services/activities/useSingleActivitySWR'
import { useQuestionSWR } from '@/services/questions/useQuestionSWR'
import { Question } from '@prisma/client'
import { Button, Form, Input, Select, Space, Switch, Typography } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { SelectContainer } from '../decks/DeckCategories'
import FormLabel from '../FormLabel'
import { StyledCard } from '../game/QuizCard'
import { SwitchContainer } from '../questions/QuestionForm'
import ActivityQuestionOrderList from './ActivityQuestionOrderList'
import PassingPercentage from 'components/courses/PassingPercentage'
const { Title } = Typography,
    { Item } = Form,
    { TextArea } = Input

export interface IActivityForm {
    title: string
    questions: Array<string>
    questionOrder: Array<string>
    description: string
    displayOnMain: boolean
    percentToPass: number
}

const ActivityForm = () => {
    const [form] = Form.useForm<IActivityForm>()
    const { createActivity, updateActivity } = useActivityCRUD()
    const [loading, setLoading] = useState(false)
    const [passing, setPassing] = useState(90)
    const swrQuestions = useQuestionSWR()
    const ourActivity = useSingleActivitySWR({})

    const questions = Form.useWatch('questions', form)

    const { query } = useRouter()

    useEffect(() => {
        if (ourActivity) {
            form.setFieldsValue({
                description: ourActivity?.description,
                questions: ourActivity?.questions?.map(q => q.id),
                title: ourActivity?.title,
                questionOrder: ourActivity?.questionOrder,
                displayOnMain: ourActivity.displayOnMain,
                percentToPass: ourActivity?.percentToPass,
            })
        }
    }, [ourActivity, form])

    return (
        <StyledCard
            loading={Boolean(query.id && !ourActivity)}
            title={
                <Title level={1}>{query.id ? 'Edit' : 'Create'} Activity</Title>
            }
        >
            <Form<IActivityForm>
                layout='vertical'
                form={form}
                initialValues={{
                    questions: [],
                    questionOrder: [],
                    displayOnMain: false,
                    percentToPass: 90,
                }}
                disabled={loading}
                onFinish={async val => {
                    setLoading(true)
                    const saved = ourActivity
                        ? await updateActivity({ ...val, id: ourActivity.id })
                        : await createActivity(val)
                    if (saved && !ourActivity) form.resetFields()
                    setLoading(false)
                }}
            >
                <SwitchContainer>
                    <Item
                        name='displayOnMain'
                        label={<FormLabel label='Display on Main?' />}
                        valuePropName='checked'
                    >
                        <Switch />
                    </Item>
                </SwitchContainer>

                <Item
                    label={<FormLabel label='Activity Title' />}
                    rules={[
                        { required: true, message: 'Please enter a title' },
                    ]}
                    name='title'
                >
                    <Input placeholder='Activity Title' />
                </Item>
                <Item
                    label={<FormLabel label='Activity Description' />}
                    rules={[
                        {
                            required: true,
                            message: 'Please enter a description',
                        },
                    ]}
                    name='description'
                >
                    <TextArea placeholder='Activity Description' />
                </Item>
                <Item
                    label={<FormLabel label='Passing Percentage' />}
                    name='percentToPass'
                    rules={[
                        {
                            required: true,
                            message: `Please enter a passing percentage`,
                        },
                    ]}
                >
                    <PassingPercentage value={passing} onChange={setPassing} />
                </Item>
                <SelectContainer>
                    <Item
                        label={<FormLabel label='Questions' />}
                        name='questions'
                        rules={[
                            {
                                required: true,
                                message:
                                    'Please select the questions to include in this activity',
                            },
                        ]}
                    >
                        <Select
                            options={swrQuestions?.map(q => ({
                                value: q.id,
                                label: q.question,
                            }))}
                            getPopupContainer={el =>
                                el.parentNode as HTMLElement
                            }
                            mode='multiple'
                            placeholder='Select Questions'
                            filterOption={(input, option) =>
                                option?.label
                                    ?.toLowerCase()
                                    ?.includes(input?.toLowerCase()) || false
                            }
                        />
                    </Item>
                </SelectContainer>
                <Item
                    name='orderedQuestions'
                    label={<FormLabel label='Question Order' />}
                >
                    <ActivityQuestionOrderList
                        filteredQuestions={questions?.map(
                            id =>
                                swrQuestions?.find(
                                    sQ => sQ.id === id
                                ) as Question
                        )}
                        form={form}
                    />
                </Item>
                <Space size='large'>
                    <Item>
                        <Button
                            loading={loading}
                            type='primary'
                            aria-label='Save activity'
                            htmlType='submit'
                        >
                            {query.id ? 'Edit' : 'Create'}
                        </Button>
                    </Item>
                    <Item>
                        <Button danger htmlType='reset'>
                            Reset
                        </Button>
                    </Item>
                </Space>
            </Form>
        </StyledCard>
    )
}

export default ActivityForm
