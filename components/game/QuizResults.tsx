import {
    Button,
    Col,
    Collapse,
    Grid,
    Result,
    Row,
    Skeleton,
    Space,
    Spin,
    Statistic,
} from 'antd'
import styled from 'styled-components'
import Link from 'next/link'
import PlayAgain from '@/components/game/PlayAgain'
import { useEffect, useState } from 'react'
import { CorrectStatus } from '@prisma/client'
import { QuizProps, QuizTypes } from '@/components/game/Quiz'
import { useGameTypeData } from '@/services/useGameTypeData'
import { useSingleActivitySessionSWR } from '@/services/activitySession/useSingleActivitySessionSWR'
import { useSingularCourseSessionSWR } from '@/services/courseSession/useSingularCourseSessionSWR'
import { useEditableConfig } from '@/questions/Table/editableConfig'
const { Panel } = Collapse

const ResultContainer = styled.div`
    .ant-result-extra {
        align-items: center;
        display: flex;
        flex-direction: column;
    }
`

export const CollapseWrapper = styled.div`
    .ant-collapse {
        color: rgba(232, 230, 227, 0.85);
        list-style-image: none;
        background-color: rgb(27, 29, 30);
        border-color: rgb(99, 92, 82) rgb(99, 92, 82) currentcolor;
    }
    .ant-collapse > .ant-collapse-item {
        border-bottom-color: rgb(99, 92, 82);
    }
`

const resultTypes: Record<QuizTypes, any> = {
    free: {
        title: 'Game',
    },
    course: {
        title: 'Course',
    },
    activity: {
        title: 'Activity',
    },
}

const QuizResults = ({ type = 'free' }: QuizProps) => {
    const session = useGameTypeData({ type })
    const { data: activitySession, isLoading } = useSingleActivitySessionSWR({})
    const [loading, setLoading] = useState(false)
    const breakpoint = Grid.useBreakpoint()

    useEffect(() => setLoading(isLoading), [isLoading])

    const resultButtons = (
        <Space direction={'horizontal'}>
            <Link legacyBehavior href={`/play/game/review/${session?.id}`}>
                <a>
                    <Button
                        type={'primary'}
                        key={'reviewQuestions'}
                        size={breakpoint.md ? 'middle' : 'small'}
                    >
                        Review Questions
                    </Button>
                </a>
            </Link>
            <PlayAgain loading={loading} setLoading={setLoading} type={type} />
        </Space>
    )

    /*TODO : make the status change for the course also - 
  we aren't playing courses right now so this isn't important.
  refactor this out into own fn later */

    return (
        <Row justify={'center'}>
            <ResultContainer>
                {loading ? (
                    <Spin tip={'Configuring Activity...'} />
                ) : (
                    <>
                        {session && (
                            <Skeleton active loading={loading}>
                                <Result
                                    status={
                                        type === 'free' ||
                                        type === 'course' ||
                                        (type === 'activity' &&
                                            activitySession?.passed)
                                            ? 'success'
                                            : 'error'
                                    }
                                    title={`${resultTypes[type].title} Completed`}
                                    subTitle={'See below to play again!'}
                                    extra={resultButtons}
                                />
                            </Skeleton>
                        )}
                        <Row justify={'center'}>
                            <Col span={22}>
                                <CollapseWrapper>
                                    <Collapse>
                                        <Panel
                                            key={'stats'}
                                            header={'View Stats'}
                                        >
                                            <Row gutter={[16, 16]}>
                                                <Col span={24} sm={8}>
                                                    <Statistic
                                                        title={
                                                            'Questions Correct'
                                                        }
                                                        value={
                                                            session?.numberCorrect
                                                        }
                                                    />
                                                </Col>
                                                <Col span={24} sm={8}>
                                                    <Statistic
                                                        title={
                                                            'Waiting to be graded'
                                                        }
                                                        value={
                                                            session?.answerHistory?.filter(
                                                                a =>
                                                                    a.isCorrect ===
                                                                    CorrectStatus.NEEDS_GRADED
                                                            ).length
                                                        }
                                                    />
                                                </Col>
                                                <Col span={24} sm={8}>
                                                    <Statistic
                                                        title={'Incorrect'}
                                                        value={
                                                            session?.answerHistory?.filter(
                                                                a =>
                                                                    a.isCorrect ===
                                                                    CorrectStatus.FALSE
                                                            ).length
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        </Panel>
                                    </Collapse>
                                </CollapseWrapper>
                            </Col>
                        </Row>
                    </>
                )}
            </ResultContainer>
        </Row>
    )
}

export default QuizResults
