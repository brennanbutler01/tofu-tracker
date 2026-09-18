import { List } from 'antd'
import { CourseWithDecks } from '@/pages/api/courses'
import styled from 'styled-components'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'
import { IPlayCourse } from '@/components/game/PlayCourseListItem'
import PlayPreReqsListItem from '@/components/game/PlayPreReqsListItem'

const ListWrapper = styled.div`
    .ant-list-split .ant-list-item {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-3']};
    }
    .ant-list-bordered {
        border: 1px solid ${props => props.theme['tofu-brand-4']};
    }
`
const PlayPreReqsList = ({ item }: IPlayCourse) => {
    const courses = useCoursesSWR({})

    return (
        <ListWrapper>
            <List
                bordered
                dataSource={item.preReqs.map<CourseWithDecks>(
                    id =>
                        courses.find(
                            course => course.id === id
                        ) as CourseWithDecks
                )}
                renderItem={item => <PlayPreReqsListItem item={item} />}
            />
        </ListWrapper>
    )
}

export default PlayPreReqsList
