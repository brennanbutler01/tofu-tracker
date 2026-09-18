import { Col, Divider, Empty, List, Row, Space, Typography } from 'antd'
import { CourseWithDecks } from '@/pages/api/courses'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'
import styled from 'styled-components'
import { IPlayCourse } from '@/components/game/PlayCourseListItem'
import PlayPreReqsList from '@/components/game/PlayPreReqsList'
const {
        Item,
        Item: { Meta },
    } = List,
    { Text } = Typography

const PreReqsTitle = styled(Text)`
    font-size: 1.25rem;
`

const PlayCourseListItemDescription = ({ item }: IPlayCourse) => {
    return (
        <Row>
            <Col span={24}>{item.description}</Col>
            <Divider />
            {item.preReqs.length > 0 && (
                <Col span={24}>
                    <Space style={{ width: '100%' }} direction={'vertical'}>
                        <PreReqsTitle type={'secondary'}>
                            {' '}
                            Pre-Reqs{' '}
                        </PreReqsTitle>
                        <PlayPreReqsList item={item} />
                    </Space>
                </Col>
            )}
        </Row>
    )
}
export default PlayCourseListItemDescription
