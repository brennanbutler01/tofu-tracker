import { List, Tabs } from 'antd'
import React, { useState } from 'react'

import CourseDecksList from '@/components/courses/CourseDecksList'
import CourseInfoBody from '@/components/courses/CourseInfoBody'
import { CourseWithDecks } from '@/pages/api/courses'
import DeleteItem from '@/components/DeleteItem'
import { EditOutlined } from '@ant-design/icons'
import { Models } from '@/utils/message.utils'
import PreReqsList from '@/components/courses/PreReqsList'
import { StyledCard } from '@/components/game/QuizCard'
import styled from 'styled-components'
import { useCoursesCRUD } from '@/services/courses/useCoursesCRUD'
import { useRouter } from 'next/router'

const { Item } = List,
    { TabPane } = Tabs

interface ICourseListItem {
    course: CourseWithDecks
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const CourseWrapper = styled.div`
    .ant-tabs-tabpane {
        margin-bottom: 10px;
    }
`

const CourseListItem = ({ course, setLoading }: ICourseListItem) => {
    const { deleteCourse } = useCoursesCRUD()
    const [cardLoading, setCardLoading] = useState(false)
    const { push } = useRouter()
    const navigateToEdit = async () => await push(`courses/edit/${course.id}`)

    return (
        <Item key={course.id}>
            <CourseWrapper>
                <StyledCard
                    loading={cardLoading}
                    actions={[
                        <DeleteItem
                            key={'delete'}
                            onDelete={async () => {
                                //set our list loading
                                setLoading(true)
                                await deleteCourse(course.id)
                                setLoading(false)
                            }}
                            model={Models.COURSES}
                        />,
                        <EditOutlined key='edit' onClick={navigateToEdit} />,
                    ]}
                    title={course.title}
                >
                    <Tabs tabPosition={'bottom'} key={'course-item-tab'}>
                        <TabPane tab={'info'} key={'info'}>
                            <CourseInfoBody course={course} />
                        </TabPane>
                        <TabPane tab={'pre-reqs'} key={'pre-reqs-tab'}>
                            <PreReqsList
                                course={course}
                                setCardLoading={setCardLoading}
                            />
                        </TabPane>
                        <TabPane key={'decks'} tab={'decks'}>
                            <CourseDecksList course={course} />
                        </TabPane>
                    </Tabs>
                </StyledCard>
            </CourseWrapper>
        </Item>
    )
}
export default CourseListItem
