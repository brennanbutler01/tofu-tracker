import { IPlayCourse } from '@/components/game/PlayCourseListItem'
import { List, Progress, Space, Typography } from 'antd'
import { useCourseSessionSWR } from '@/services/courseSession/useCourseSessionSWR'
import styled from 'styled-components'
const {
        Item,
        Item: { Meta },
    } = List,
    { Paragraph } = Typography

const ProgressContainer = styled.div`
    .ant-progress-inner {
        background-color: rgb(30, 32, 33);
    }
`

const PlayPreReqsListItem = ({ item }: IPlayCourse) => {
    const courseSessions = useCourseSessionSWR({})
    const isPreReqPassed = courseSessions?.some(
        session => session.courseId === item.id && session.passed
    )
    const isPreReqInProgress = courseSessions?.some(
        session => session.courseId === item.id && !session.isComplete
    )
    const isPreReqNotStarted = !courseSessions?.some(
        session => session.courseId === item.id
    )
    const isPreReqFailed = courseSessions
        ?.filter(session => session.courseId === item.id)
        ?.every(session => session.isComplete && !session.passed)

    return (
        <Item key={item.id}>
            <Meta
                title={item.title}
                description={
                    <Space direction={'vertical'} style={{ width: '100%' }}>
                        <Paragraph
                            type={'secondary'}
                            style={{ marginBottom: 0 }}
                        >
                            {item.description}
                        </Paragraph>
                        <ProgressContainer>
                            <Progress
                                showInfo={isPreReqPassed || isPreReqFailed}
                                percent={
                                    isPreReqPassed
                                        ? 100
                                        : isPreReqInProgress
                                        ? 75
                                        : 0
                                }
                                status={
                                    isPreReqPassed
                                        ? 'success'
                                        : isPreReqInProgress
                                        ? 'active'
                                        : isPreReqNotStarted
                                        ? 'normal'
                                        : 'exception'
                                }
                            />
                        </ProgressContainer>
                    </Space>
                }
            />
        </Item>
    )
}
export default PlayPreReqsListItem
