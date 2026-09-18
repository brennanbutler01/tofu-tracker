import { Card, Form, Tabs, Typography } from 'antd'
import React from 'react'
import CourseOrder from '@/components/learningTracks/CourseOrder'
import { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'
const { TabPane } = Tabs,
    { Meta } = Card,
    { Paragraph } = Typography

interface ICourseTabs {
    track: LearningTrackWithOrderedCourses
}

const LearningTrackCardTabs = ({ track }: ICourseTabs) => {
    const [form] = Form.useForm()

    return (
        <Tabs tabPosition={'bottom'}>
            <TabPane key={'description'} tab={'Description'}>
                <Meta
                    description={
                        <Paragraph
                            ellipsis
                            style={{ whiteSpace: 'break-spaces' }}
                        >
                            {track.description}
                        </Paragraph>
                    }
                />
            </TabPane>
            <TabPane key={'courses'} tab={'Courses'}>
                <CourseOrder
                    editingTrack={track}
                    form={form}
                    courses={track?.courseOrder?.map(c => c.courseId)}
                />
            </TabPane>
        </Tabs>
    )
}
export default LearningTrackCardTabs
