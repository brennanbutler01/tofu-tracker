import { StyledCard } from '@/components/game/QuizCard'
import { StyledTag } from '@/decks/DeckTags'
import {
    Button,
    Card,
    List,
    Result,
    Space,
    Spin,
    Statistic,
    Typography,
} from 'antd'
import PlayCourseListItemDescription from '@/components/game/PlayCourseListItemDescription'
import { CourseWithDecks } from '@/pages/api/courses'
import { useCourseSessionCRUD } from '@/services/courseSession/useCourseSessionCRUD'
import { useCourseSessionSWR } from '@/services/courseSession/useCourseSessionSWR'
import { useRouter } from 'next/router'
import { getNumberWithOrdinal } from '@/utils/getNumberWithOrdinal'
import { passedAllPreReqs } from '@/components/game/StudyCourseFilters'
import styled from 'styled-components'
import React from 'react'
const { Item } = List,
    { Meta } = Card,
    { Title } = Typography

export interface IPlayCourse {
    item: CourseWithDecks
}

const MetaContainer = styled.div`
    .ant-card-meta {
        display: flex;
        justify-content: center;
    }
`

const PlayCourseListItem = ({ item }: IPlayCourse) => {
    const { createCourseSession } = useCourseSessionCRUD()
    const courseSessions = useCourseSessionSWR({})

    const hasSessionAlready = courseSessions?.find(
        session =>
            session.courseId === item.id && !session?.gameSession?.isComplete
    )
    const coursePassed = courseSessions?.find(
        session => session.courseId === item.id && session.passed
    )

    const { push } = useRouter()

    const preReqsCompleted = passedAllPreReqs(item, courseSessions)

    const formatAttempts = () => {
        if (courseSessions) {
            const numberOfAttempts = courseSessions?.filter(
                session => session?.courseId === item.id
            )?.length
            return numberOfAttempts === 0
                ? preReqsCompleted
                    ? `You haven't played this one yet.`
                    : `Complete the pre-reqs to unlock this course.`
                : `Attempt: ${getNumberWithOrdinal(numberOfAttempts)}`
        }
        return <Spin />
    }

    const StyledContainer = coursePassed ? MetaContainer : React.Fragment

    return (
        <Item key={item.id}>
            <StyledCard
                title={<Title level={3}>{item.title}</Title>}
                loading={!item}
                extra={
                    <Space direction={'vertical'} style={{ width: '100%' }}>
                        <StyledTag key={'level'}>Level: {item.level}</StyledTag>
                        {formatAttempts()}
                    </Space>
                }
                {...(preReqsCompleted && {
                    actions: [
                        <Button
                            key={'play'}
                            onClick={async () => {
                                if (hasSessionAlready) {
                                    await push(
                                        `/play/study/session/${hasSessionAlready.id}`
                                    )
                                } else {
                                    const newCourseSession =
                                        await createCourseSession({
                                            courseId: item.id,
                                        })
                                    await push(
                                        `/play/study/session/${newCourseSession}`
                                    )
                                }
                            }}
                        >
                            {hasSessionAlready ? 'Edit ' : 'Play '}
                            Game
                        </Button>,
                    ],
                })}
            >
                <StyledContainer>
                    <Meta
                        description={
                            coursePassed ? (
                                <Result
                                    status={'success'}
                                    title={'Passed!'}
                                    extra={
                                        <Statistic
                                            title={'Your Score'}
                                            value={
                                                (coursePassed?.gameSession
                                                    ?.numberCorrect /
                                                    coursePassed?.gameSession
                                                        ?.numberAnswered) *
                                                100
                                            }
                                        />
                                    }
                                />
                            ) : (
                                <PlayCourseListItemDescription item={item} />
                            )
                        }
                    />
                </StyledContainer>
            </StyledCard>
        </Item>
    )
}
export default PlayCourseListItem
