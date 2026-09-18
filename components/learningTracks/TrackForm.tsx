import {
    Button,
    Col,
    Form,
    Input,
    Row,
    Space,
    Typography,
    notification,
} from 'antd'
import {
    ISetTab,
    TrackTabs,
} from '@/components/learningTracks/LearningTrackTabs'
import React, { useEffect, useState } from 'react'

import FormLabel from '@/components/FormLabel'
import { SelectContainer } from '@/decks/DeckCategories'
import { StyledCard } from '@/components/game/QuizCard'
import TrackCourseSelect from './TrackCourseSelect'
import { useLearningTrackCRUD } from '@/services/learningTrack/useLearningTrackCRUD'
import CourseOrder from '@/components/learningTracks/CourseOrder'
import { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'
import { useEditLearningTrackCRUD } from '@/services/learningTrack/useEditLearningTrackCRUD'

const { Item } = Form,
    { Title } = Typography,
    { TextArea } = Input

export interface ITrackForm {
    title: string
    courses: Array<string>
    description: string
    courseOrder: Array<string>
}

interface TrackFormProps extends Partial<ISetTab> {
    editingTrack?: LearningTrackWithOrderedCourses
}

const TrackForm = ({ setTab, editingTrack }: TrackFormProps) => {
    const [form] = Form.useForm<ITrackForm>()
    const { createLearningTrack } = useLearningTrackCRUD()
    const [loading, setLoading] = useState(false)
    const [value, setValue] = useState<Array<string>>([])
    const courses = Form.useWatch('courses', form)
    const { editLearningTrack } = useEditLearningTrackCRUD()

    useEffect(() => {
        if (editingTrack) {
            form.setFieldsValue({
                title: editingTrack.title,
                description: editingTrack.description,
                courseOrder: editingTrack.courseOrder.map(course => course.courseId),
                courses: editingTrack?.courseOrder?.map(
                    course => course.courseId
                ),
            })
            console.log(form.getFieldsValue())
        }
    }, [form, editingTrack])

    return (
        <Row justify={'center'}>
            <Col span={24} md={16}>
                <StyledCard
                    title={
                        <Title level={3}>
                            {editingTrack ? 'Edit' : 'Create'} Learning Track
                        </Title>
                    }
                    loading={loading}
                >
                    <Form
                        form={form}
                        layout={'vertical'}
                        onFinish={async val => {
                            if (setTab && !editingTrack) {
                                setLoading(true)
                                await createLearningTrack(val)
                                notification.success({
                                    message: 'Learning Track Created!',
                                    description: 'Please click here to view.',
                                    onClick: () => {
                                        setTab(TrackTabs.view)
                                        notification.destroy()
                                    },
                                    style: { cursor: 'pointer' },
                                })
                                setLoading(false)
                                form.resetFields()
                            } else if (editingTrack) {
                                await editLearningTrack({
                                    id: editingTrack.id,
                                    ...form.getFieldsValue(),
                                })
                            }
                        }}
                    >
                        <Item
                            name={'title'}
                            label={<FormLabel label={'Title'} />}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Please make sure to add a title for the learning track.',
                                },
                            ]}
                        >
                            <Input placeholder={'Track Title'} />
                        </Item>
                        <SelectContainer>
                            <Item
                                name={'courses'}
                                label={<FormLabel label={'Courses'} />}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please select at least one (1) course!',
                                    },
                                ]}
                            >
                                <TrackCourseSelect
                                    value={value}
                                    onChange={setValue}
                                />
                            </Item>
                        </SelectContainer>
                        <FormLabel label={'Course Order'} />
                        <Item
                            name={'courseOrder'}
                            noStyle
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '8px',
                            }}
                        >
                            <CourseOrder
                                courses={courses}
                                form={form}
                                editingTrackPage={editingTrack}
                            />
                        </Item>
                        <Item
                            name='description'
                            label={<FormLabel label='Description' />}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Please enter a description for this learning track. Learners will want to know what it is!',
                                },
                            ]}
                        >
                            <TextArea placeholder='Learning Track Description' />
                        </Item>
                        <Space>
                            <Item>
                                <Button
                                    loading={loading}
                                    danger
                                    htmlType={'reset'}
                                >
                                    Reset
                                </Button>
                            </Item>
                            <Item>
                                <Button
                                    loading={loading}
                                    htmlType={'submit'}
                                    type={'primary'}
                                >
                                    {editingTrack ? 'Edit' : 'Confirm'}
                                </Button>
                            </Item>
                        </Space>
                    </Form>
                </StyledCard>
            </Col>
        </Row>
    )
}

export default TrackForm
