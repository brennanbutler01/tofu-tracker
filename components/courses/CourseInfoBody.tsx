import { Card, Col, Row, Space, Statistic } from 'antd'
import React from 'react'
import { Course } from '@prisma/client'
import FormLabel from '@/components/FormLabel'
import { useTheme } from 'styled-components'
import CourseLevelTags from '@/components/courses/CourseLevelTags'
const { Meta } = Card

interface ICourseInfoBody {
    course: Course
}

const CourseInfoBody = ({ course }: ICourseInfoBody) => {
    const theme = useTheme()
    return (
        <Meta
            title={
                <Space
                    size={'large'}
                    style={{
                        borderBottom: `1px solid ${theme['tofu-brand-5']}`,
                        paddingBottom: '9px',
                        marginTop: '9px',
                    }}
                >
                    <FormLabel label={'Level'} />
                    <CourseLevelTags level={course.level} />
                </Space>
            }
            description={
                <Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
                    <Col span={12}>
                        <Statistic
                            title={'Passing Score'}
                            suffix={'%'}
                            value={course.percentToPass}
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title={'Pre-Reqs'}
                            suffix={'#'}
                            value={course?.preReqs?.length}
                        />
                    </Col>
                </Row>
            }
        />
    )
}

export default CourseInfoBody
