import { Col, Empty, List, Row, Segmented } from 'antd'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'

import PlayCourseListItem from '@/components/game/PlayCourseListItem'
import { SegmentWrapper } from '@/components/game/ResultsSegment'
import StudyCourseFilters from '@/components/game/StudyCourseFilters'
import { useEffect, useState } from 'react'
import { CourseWithDecks } from '@/pages/api/courses'

const PlayCourseList = () => {
    const courses = useCoursesSWR({})
    const [filteredCourses, setFilteredCourses] = useState<
        Array<CourseWithDecks>
    >([])

    useEffect(() => courses && setFilteredCourses(courses), [courses])
    return (
        <Row gutter={[0, 16]}>
            <Col span={24}>
                <StudyCourseFilters
                    filteredCourses={filteredCourses}
                    setFilteredCourses={setFilteredCourses}
                />
            </Col>
            <Col span={24}>
                <List
                    loading={!courses}
                    dataSource={filteredCourses}
                    locale={{
                        emptyText: (
                            <Empty description={'No courses match filter'} />
                        ),
                    }}
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 3,
                        xl: 4,
                        xxl: 4,
                    }}
                    renderItem={item => <PlayCourseListItem item={item} />}
                />
            </Col>
        </Row>
    )
}
export default PlayCourseList
