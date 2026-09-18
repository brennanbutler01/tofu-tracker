import {
    Button,
    Col,
    Empty,
    Form,
    Input,
    Row,
    Select,
    Space,
    Typography,
    notification,
} from 'antd'
import React, { useEffect, useState } from 'react'

import CourseDecksSelect from '@/components/courses/CourseDecksSelect'
import { CourseLevel } from '@prisma/client'
import { CourseTabKeys } from '@/components/courses/CourseTabs'
import { CourseWithDecks } from '@/pages/api/courses'
import FormLabel from '@/components/FormLabel'
import PassingPercentage from '@/components/courses/PassingPercentage'
import PreReqsSelect from './PreReqsSelect'
import { SelectContainer } from '@/decks/DeckCategories'
import { StyledCard } from '@/components/game/QuizCard'
import { useCoursesCRUD } from '@/services/courses/useCoursesCRUD'
import useEditCoursesCRUD from '@/services/courses/useEditCoursesCRUD'
import { useRouter } from 'next/router'

const { Item } = Form,
    { Title } = Typography,
    { TextArea } = Input

export interface ICourseForm {
    title: string
    decks: Array<string>
    passingPercentage: number
    level: CourseLevel
    preReqs: Array<string>
    description: string
}

interface CourseFormProps {
    setCourseTab?: React.Dispatch<React.SetStateAction<CourseTabKeys>>
    editingCourse?: CourseWithDecks
}

const CourseForm = ({ setCourseTab, editingCourse }: CourseFormProps) => {
    const [form] = Form.useForm<ICourseForm>()
    const [percentageValue, setPercentageValue] = useState(90)
    const { createCourse } = useCoursesCRUD()
    const [loading, setLoading] = useState(false)
    const [preReqs, setPreReqs] = useState<Array<string>>([])
    const [value, setValue] = useState<Array<string>>([])
    const changeValue = (val: Array<string>) => setValue(val)
    const cardTitle = editingCourse ? 'Edit' : 'Create'
    const { updateCourse } = useEditCoursesCRUD()
    const { push } = useRouter()

    useEffect(() => {
        if (editingCourse) {
            form.setFieldsValue({
                ...editingCourse,
                decks: editingCourse?.decks?.map(deck => deck.id),
                passingPercentage: editingCourse.percentToPass,
            })
            setPercentageValue(editingCourse.percentToPass)
        }
    }, [editingCourse, form])

    return (
        <Row justify={'center'}>
            <Col span={24} sm={20} md={16} lg={12} xxl={8}>
                <StyledCard title={<Title level={3}>{cardTitle} Course</Title>}>
                    <>
                        <Form
                            initialValues={{
                                passingPercentage: 90,
                                preReqs: [],
                                decks: [],
                                level: CourseLevel.ALL,
                            }}
                            disabled={loading}
                            layout={'vertical'}
                            form={form}
                            onFinish={async val => {
                                setLoading(true)
                                if (editingCourse) {
                                    if (!(await updateCourse(val))) {
                                        setLoading(false)
                                        return
                                    }
                                    notification.open({
                                        message: 'Course updated',
                                        description:
                                            'Click here to view the new course',
                                        type: 'success',
                                        style: { cursor: 'pointer' },
                                        onClick: async () =>
                                            await push('/courses'),
                                    })
                                } else {
                                    if (!(await createCourse(val))) {
                                        setLoading(false)
                                        return
                                    }
                                    notification.open({
                                        message: 'Course Created',
                                        description:
                                            'Click here to view the new course',
                                        type: 'success',
                                        style: { cursor: 'pointer' },
                                        onClick: () =>
                                            setCourseTab &&
                                            setCourseTab(CourseTabKeys.view),
                                    })
                                }
                                setLoading(false)
                                if (!editingCourse) form.resetFields()
                            }}
                        >
                            <Row gutter={[16, 0]}>
                                <Col span={24}>
                                    <Item
                                        name={'title'}
                                        label={
                                            <FormLabel label={'Course Title'} />
                                        }
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please enter a course title',
                                            },
                                        ]}
                                    >
                                        <Input placeholder={'Course Title'} />
                                    </Item>
                                </Col>
                                <Col span={24}>
                                    <Item
                                        name='description'
                                        label={
                                            <FormLabel label='Description' />
                                        }
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please enter a description for the course so learners know what it is!',
                                            },
                                        ]}
                                    >
                                        <TextArea placeholder='Course Description...' />
                                    </Item>
                                </Col>
                                <Col span={24}>
                                    <SelectContainer>
                                        <Item
                                            name={'decks'}
                                            label={
                                                <FormLabel label={'Decks'} />
                                            }
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'Please select at least one deck to be used for this course',
                                                },
                                            ]}
                                        >
                                            <CourseDecksSelect
                                                value={value}
                                                onChange={changeValue}
                                            />
                                        </Item>
                                    </SelectContainer>
                                </Col>
                                <Col span={24}>
                                    <Item
                                        name={'passingPercentage'}
                                        label={
                                            <FormLabel
                                                label={'Passing Percentage'}
                                            />
                                        }
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please select the percentage that is needed to pass this course',
                                            },
                                        ]}
                                    >
                                        <PassingPercentage
                                            value={percentageValue}
                                            onChange={setPercentageValue}
                                        />
                                    </Item>
                                </Col>
                                <Col span={24} md={12}>
                                    <SelectContainer>
                                        <Item
                                            name={'level'}
                                            label={
                                                <FormLabel
                                                    label={'Course Level'}
                                                />
                                            }
                                            initialValue={CourseLevel.ALL}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'Please select a level for the course',
                                                },
                                            ]}
                                        >
                                            <Select
                                                getPopupContainer={el =>
                                                    el.parentNode
                                                }
                                                placeholder={'Course Level'}
                                                options={Object.values(
                                                    CourseLevel
                                                ).map(level => ({
                                                    label: level,
                                                    value: level,
                                                }))}
                                                filterOption={(input, option) =>
                                                    option?.label
                                                        ?.toLowerCase()
                                                        ?.includes(
                                                            input?.toLowerCase()
                                                        ) || false
                                                }
                                                showSearch
                                                notFoundContent={
                                                    <Empty
                                                        description={
                                                            "Search doesn't match any course levels."
                                                        }
                                                    />
                                                }
                                            />
                                        </Item>
                                    </SelectContainer>
                                </Col>
                                <Col span={24}>
                                    <SelectContainer>
                                        <Item
                                            name={'preReqs'}
                                            label={
                                                <FormLabel
                                                    label={'Pre-Requisites'}
                                                />
                                            }
                                        >
                                            <PreReqsSelect
                                                value={preReqs}
                                                onChange={setPreReqs}
                                                {...(editingCourse && {
                                                    course: editingCourse,
                                                })}
                                            />
                                        </Item>
                                    </SelectContainer>
                                </Col>
                                <Col span={24}>
                                    <Space>
                                        <Item>
                                            <Button danger htmlType={'reset'}>
                                                Reset
                                            </Button>
                                        </Item>
                                        <Item>
                                            <Button
                                                loading={loading}
                                                type={'primary'}
                                                aria-label='Save course'
                                                htmlType={'submit'}
                                            >
                                                {cardTitle}
                                            </Button>
                                        </Item>
                                    </Space>
                                </Col>
                            </Row>
                        </Form>
                    </>
                </StyledCard>
            </Col>
        </Row>
    )
}

export default CourseForm
