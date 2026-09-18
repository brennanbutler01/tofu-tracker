import { Button, Col, Empty, List, Row } from 'antd'
import React, { useState } from 'react'

import CourseListItem from '@/components/courses/CourseListItem'
import { CourseTabKeys } from '@/components/courses/CourseTabs'
import styled from 'styled-components'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'
import CourseFilters, { CourseFilter } from '@/components/courses/CourseFilters'
import { CourseWithDecks } from '@/pages/api/courses'

// noinspection CssMissingComma
const ListContainer = styled.div`
    .ant-list-split .ant-list-item {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
    }
    .ant-collapse {
        color: rgba(232, 230, 227, 0.85);
        list-style-image: none;
        background-color: rgb(27, 29, 30);
        border-color: rgb(99, 92, 82) rgb(99, 92, 82) currentcolor;
    }
    .ant-list-split.ant-list-something-after-last-item
        .ant-spin-container
        > .ant-list-items
        > .ant-list-item:last-child {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-5']};
    }

    margin-top: 15px;
`

interface ICourseList {
    setCourseTab: React.Dispatch<React.SetStateAction<CourseTabKeys>>
}

const CourseList = ({ setCourseTab }: ICourseList) => {
    const courses = useCoursesSWR({})
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState<CourseFilter>('none')
    const [search, setSearch] = useState('')

    const filterCourseBySearch = (course: CourseWithDecks) => {
        if (search) {
            return course.title.toLowerCase().includes(search.toLowerCase())
        }
        return true
    }

    const filterCourseByLevel = () => {
        if (courses) {
            if (filter === 'none') {
                //if we have no filter, we will show all courses
                return courses.filter(course => filterCourseBySearch(course))
            } else {
                //else we are just going to show course that meets are desired level
                return courses.filter(
                    course =>
                        course.level === filter && filterCourseBySearch(course)
                )
            }
        }
    }

    return (
        <ListContainer>
            <Row gutter={[0, 16]}>
                <Col span={24}>
                    <CourseFilters
                        filter={filter}
                        setFilter={setFilter}
                        search={search}
                        setSearch={setSearch}
                    />
                </Col>
                <Col span={24}>
                    <List
                        dataSource={filterCourseByLevel()}
                        grid={{
                            gutter: 24,
                            xs: 1,
                            sm: 2,
                            md: 3,
                            lg: 3,
                            xl: 4,
                            xxl: 5,
                        }}
                        loading={!courses || loading}
                        renderItem={course => (
                            <CourseListItem
                                course={course}
                                setLoading={setLoading}
                            />
                        )}
                        locale={{
                            emptyText: (
                                <Empty description={'No Courses'}>
                                    <Button
                                        onClick={() =>
                                            setCourseTab(CourseTabKeys.create)
                                        }
                                    >
                                        Add Course
                                    </Button>
                                </Empty>
                            ),
                        }}
                    />
                </Col>
            </Row>
        </ListContainer>
    )
}

export default CourseList
