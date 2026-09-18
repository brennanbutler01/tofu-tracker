import { List, Tabs } from 'antd'
import { useLearningTrackSWR } from '@/services/learningTrack/useLearningTrackSWR'
import PlayCourseList from '@/components/game/PlayCourseList'
import styled from 'styled-components'
const { TabPane } = Tabs,
    { Item } = List

const TabContentWrapper = styled.div`
    .ant-tabs-tabpane {
        margin-top: 15px;
    }
`

const StructuredStudyTabs = () => {
    const learningTracks = useLearningTrackSWR({})
    return (
        <TabContentWrapper>
            <Tabs>
                <TabPane tab={'Courses'} key={'courses'}>
                    <PlayCourseList />
                </TabPane>
                <TabPane
                    tab={'Learning Tracks'}
                    key={'learning-tracks'}
                    disabled={learningTracks?.length === 0}
                >
                    <List
                        dataSource={learningTracks}
                        renderItem={item => (
                            <Item key={item.id}>{item.title}</Item>
                        )}
                    />
                </TabPane>
            </Tabs>
        </TabContentWrapper>
    )
}
export default StructuredStudyTabs
