import { Button, Col, Empty, List, Row } from 'antd'
import { ISetTab, TrackTabs } from './LearningTrackTabs'

import TrackListItem from './TrackListItem'
import { useLearningTrackSWR } from '@/services/learningTrack/useLearningTrackSWR'
import { useState } from 'react'

const TrackList = ({ setTab }: ISetTab) => {
    const tracks = useLearningTrackSWR({})
    const [loading, setLoading] = useState(false)
    return (
        <Row justify='center'>
            <Col span={24} md={22}>
                <List
                    loading={!tracks || loading}
                    itemLayout='vertical'
                    dataSource={tracks}
                    grid={{
                        gutter: 16,
                        sm: 1,
                        xs: 1,
                        md: 2,
                        lg: 3,
                        xl: 3,
                        xxl: 3,
                    }}
                    locale={{
                        emptyText: (
                            <Empty description='No Learning Tracks'>
                                <Button
                                    onClick={() => setTab(TrackTabs.create)}
                                >
                                    Add Track
                                </Button>
                            </Empty>
                        ),
                    }}
                    renderItem={track => (
                        <TrackListItem track={track} setLoading={setLoading} />
                    )}
                />
            </Col>
        </Row>
    )
}
export default TrackList
