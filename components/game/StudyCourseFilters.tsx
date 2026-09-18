import { SegmentWrapper } from '@/components/game/ResultsSegment'
import { Col, Collapse, Grid, Input, Radio, Row, Segmented, Space } from 'antd'
import { CollapseWrapper } from '@/components/game/QuizResults'
import React, { useEffect, useState } from 'react'
import { CourseWithDecks } from '@/pages/api/courses'
import { useCourseSessionSWR } from '@/services/courseSession/useCourseSessionSWR'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'
import { CourseLevel } from '@prisma/client'
import { FullCourseSession } from '@/pages/api/courseSession/[id]'
import { GroupContainer } from '@/questions/QuestionTypes'
const { Panel } = Collapse,
    { Search } = Input

enum SegmentedValues {
    'all' = 'all',
    'passed' = 'passed',
    'unlocked' = 'unlocked',
    'in-progress' = 'in-progress',
    'locked' = 'locked',
    'failed' = 'failed',
    'none' = 'none',
}

const options = [
    { label: 'All', value: SegmentedValues.all },
    { label: 'Passed', value: SegmentedValues.passed },
    { label: 'Failed', value: SegmentedValues.failed },
    { label: 'Unlocked', value: SegmentedValues.unlocked },
    { label: 'In-Progress', value: SegmentedValues['in-progress'] },
    { label: 'Locked', value: SegmentedValues.locked },
]

interface ICourseFilters {
    filteredCourses: Array<CourseWithDecks>
    setFilteredCourses: React.Dispatch<
        React.SetStateAction<Array<CourseWithDecks>>
    >
}

export const passedAllPreReqs = (
    course: CourseWithDecks,
    courseSessions: Array<FullCourseSession>
) =>
    course.preReqs.every(preReqId =>
        courseSessions?.some(
            session => session.courseId === preReqId && session.passed
        )
    )

const StudyCourseFilters = ({
    filteredCourses,
    setFilteredCourses,
}: ICourseFilters) => {
    const [selectedFilter, setSelectedFilter] = useState<SegmentedValues>(
        SegmentedValues.none
    )

    const courseSessions = useCourseSessionSWR({})
    const courses = useCoursesSWR({})

    useEffect(() => {
        if (selectedFilter === SegmentedValues.none && courses) {
            setSelectedFilter(SegmentedValues.all)
            setFilteredCourses(courses)
        }
    }, [setFilteredCourses, selectedFilter, courses])

    const segmentedFilterFunctions: Record<SegmentedValues, Function> = {
        all: () => courses,
        passed: () =>
            courses.filter(
                course =>
                    !!courseSessions.find(
                        session =>
                            session.passed && course.id === session?.courseId
                    )
            ),
        failed: () =>
            courses.filter(course => {
                console.log(
                    courseSessions.find(
                        session => session.course.level === CourseLevel.ADVANCED
                    )
                )
                //have we passed this one?
                const passed = courseSessions.some(
                    session => session.courseId === course.id && session.passed
                )
                //have we completed && failed this one?
                const failed = courseSessions.some(
                    session =>
                        session.courseId === course.id &&
                        session.isComplete &&
                        !session.passed
                )

                return !passed && failed
            }),
        unlocked: () =>
            //only show those that have all prereqs passed
            courses.filter(course => passedAllPreReqs(course, courseSessions)),
        'in-progress': () =>
            courses.filter(course =>
                courseSessions.find(
                    //make sure we have a session, but that it is not yet complete
                    session =>
                        session.courseId === course.id && !session.isComplete
                )
            ),
        locked: () =>
            courses.filter(course => !passedAllPreReqs(course, courseSessions)),
        none: () => 'mew',
    }

    const filterCourse = (value: SegmentedValues) => {
        setSelectedFilter(value)
        setFilteredCourses(segmentedFilterFunctions[value]())
    }

    const handleSearch = (val: string) => {
        if (val === '') {
            setFilteredCourses(segmentedFilterFunctions[selectedFilter]())
        } else {
            setFilteredCourses(
                filteredCourses.filter(
                    course =>
                        course.title
                            .toLowerCase()
                            .includes(val.trim().toLowerCase()) ||
                        course.description
                            .toLowerCase()
                            .includes(val.trim().toLowerCase())
                )
            )
        }
    }

    const breakpoint = Grid.useBreakpoint()

    return (
        <Row>
            <Col span={24} md={12} xxl={8}>
                <CollapseWrapper>
                    <Collapse>
                        <Panel header={'Filter Courses'} key={'filter'}>
                            <Space direction={'vertical'}>
                                <SegmentWrapper>
                                    <GroupContainer>
                                        {breakpoint.md ? (
                                            <Segmented
                                                options={options}
                                                value={selectedFilter}
                                                onChange={key =>
                                                    filterCourse(
                                                        key as SegmentedValues
                                                    )
                                                }
                                            />
                                        ) : (
                                            <Radio.Group
                                                options={options}
                                                value={selectedFilter}
                                                onChange={e =>
                                                    filterCourse(
                                                        e.target
                                                            .value as SegmentedValues
                                                    )
                                                }
                                            />
                                        )}
                                    </GroupContainer>
                                </SegmentWrapper>
                                <Search
                                    placeholder={'Search for courses'}
                                    onSearch={handleSearch}
                                    allowClear
                                />
                            </Space>
                        </Panel>
                    </Collapse>
                </CollapseWrapper>
            </Col>
        </Row>
    )
}
export default StudyCourseFilters
