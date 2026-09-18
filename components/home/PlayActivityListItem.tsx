import { useActivitySessionCRUD } from '@/services/activitySession/useActivitySessionCRUD'
import { useActivitySessionSWR } from '@/services/activitySession/useActivitySessionSWR'
import { Activity } from '@prisma/client'
import {
    Button,
    Card,
    Col,
    Collapse,
    List,
    Row,
    Skeleton,
    Space,
    Statistic,
} from 'antd'
import { useRouter } from 'next/router'
import React from 'react'
import { CollapseWrapper } from '../game/QuizResults'

const { Item } = List,
    { Meta } = Card,
    { Panel } = Collapse

interface IPlayActivityListItem {
    activity: Activity
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const PlayActivityListItem = ({
    activity,
    setLoading,
}: IPlayActivityListItem) => {
    const { createActivitySession } = useActivitySessionCRUD()
    const activitySessions = useActivitySessionSWR({})
    const { push } = useRouter()

    const thisActivitysSessions = activitySessions?.filter(
        session => session.activityId === activity?.id
    )

    const inProgress = thisActivitysSessions?.some(
        session => !session.isComplete
    )

    const startOrContinueSession = async () => {
        setLoading(true)

        if (inProgress) {
            await push(
                `/play/activity/${
                    thisActivitysSessions?.find(aS => !aS.isComplete)?.id
                }`
            )
        } else {
            const activitySessionId = await createActivitySession({
                activityId: activity.id,
            })

            if (activitySessionId) {
                await push(`/play/activity/${activitySessionId}`)
            }
        }

        setLoading(false)
    }

    const completeSessions = activitySessions?.filter(
        a => a.activityId === activity.id && a.isComplete
    )

    return (
        <Item key={activity.id}>
            <Space style={{ width: '100%' }} direction='vertical' size='large'>
                <Meta title={activity.title} />
                <Button onClick={startOrContinueSession} key='btn'>
                    {inProgress ? 'Continue' : 'Start'}
                </Button>
                {completeSessions?.length > 0 && (
                    <CollapseWrapper>
                        <Collapse bordered={false}>
                            <Panel header='History' key={'history'}>
                                <Row gutter={[16, 16]}>
                                    <Col span={24} md={12}>
                                        <Statistic
                                            title='Played'
                                            value={completeSessions?.length}
                                            suffix='times'
                                        />
                                    </Col>
                                    <Col span={24} md={12}>
                                        <Statistic
                                            title='Passed'
                                            value={
                                                activitySessions?.filter(
                                                    a =>
                                                        a.activityId ===
                                                            activity.id &&
                                                        a.passed
                                                )?.length
                                            }
                                            suffix='times'
                                        />
                                    </Col>
                                </Row>
                            </Panel>
                        </Collapse>
                    </CollapseWrapper>
                )}
            </Space>
        </Item>
    )
}

export default PlayActivityListItem
