import { ActivityWithQuestion } from '@/pages/api/activities'
import { useActivityCRUD } from '@/services/activities/useActivityCRUD'
import { Models } from '@/utils/message.utils'
import { StarOutlined } from '@ant-design/icons'
import { Button, Card, List, Space, Statistic, Typography } from 'antd'
import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'
import { StyledTag } from '../decks/DeckTags'
import DeleteItem from '../DeleteItem'
import { StyledCard } from '../game/QuizCard'

const { Item } = List,
    { Meta } = Card,
    { Paragraph } = Typography

const ActivityCard = styled(StyledCard)`
    .ant-card-actions > li {
        display: flex;
        justify-content: center;
        align-items: center;
    }
`

interface IActivityListItem {
    activity: ActivityWithQuestion
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const ActivityListItem = ({ activity, setLoading }: IActivityListItem) => {
    const { deleteActivity } = useActivityCRUD()

    const deleteThisActivity = async () => {
        setLoading(true)
        await deleteActivity({ activityId: activity.id })
        setLoading(false)
    }

    return (
        <Item key={activity.id}>
            <ActivityCard
                title={activity.title}
                extra={
                    activity.displayOnMain ? (
                        <StyledTag>Active!</StyledTag>
                    ) : null
                }
                actions={[
                    <Link legacyBehavior
                        href={`activities/${activity.id}`}
                        passHref
                        key='link'
                    >
                        <Button key='edit'>Edit</Button>
                    </Link>,
                    <DeleteItem
                        model={Models.ACTIVITY}
                        onDelete={deleteThisActivity}
                        key='delete'
                    />,
                ]}
            >
                <Meta
                    description={
                        <Space direction='vertical'>
                            <Paragraph ellipsis>
                                {activity.description}
                            </Paragraph>
                            <Statistic
                                value={activity?.questions?.length}
                                title='# Questions'
                            />
                        </Space>
                    }
                />
            </ActivityCard>
        </Item>
    )
}

export default ActivityListItem
