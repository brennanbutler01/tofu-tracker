import DeleteItem from '../DeleteItem'
import { List, Tooltip, Typography } from 'antd'
import { Models } from '@/utils/message.utils'
import { useLearningTrackCRUD } from '@/services/learningTrack/useLearningTrackCRUD'
import { StyledCard } from '@/components/game/QuizCard'
import React from 'react'
import { StyledTag } from '@/decks/DeckTags'
import dayjs, { formatDate } from '@/utils/dayjs'
import LearningTrackCardTabs from '@/components/learningTracks/LearningTrackCardTabs'
import { EditOutlined } from '@ant-design/icons'
import { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'
import Link from 'next/link'

const { Item } = List,
    { Title } = Typography

interface ITrackListItem {
    track: LearningTrackWithOrderedCourses
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}
const TrackListItem = ({ track, setLoading }: ITrackListItem) => {
    const { deleteLearningTrack } = useLearningTrackCRUD()

    console.log('track', track)

    return (
        <Item key={track.id}>
            <StyledCard
                actions={[
                    <DeleteItem
                        key='delete'
                        model={Models.LEARNING_TRACK}
                        onDelete={async () => {
                            setLoading(true)
                            await deleteLearningTrack({ trackId: track.id })
                            setLoading(false)
                        }}
                    />,
                    <Link legacyBehavior
                        href={`/learningTracks/edit/${track.id}`}
                        key={'edit'}
                    >
                        <a>
                            <EditOutlined />
                        </a>
                    </Link>,
                ]}
                title={
                    <Title level={3} ellipsis style={{ marginBottom: 0 }}>
                        {track.title}
                    </Title>
                }
                extra={[
                    <Tooltip title={formatDate(track.created)} key={'created'}>
                        <StyledTag>{dayjs(track.created).fromNow()}</StyledTag>
                    </Tooltip>,
                ]}
                key={track.id}
            >
                <LearningTrackCardTabs track={track} />
            </StyledCard>
        </Item>
    )
}

export default TrackListItem
