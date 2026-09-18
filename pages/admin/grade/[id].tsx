// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import { Breadcrumb, Col, PageHeader, Row, Typography } from 'antd'
import {
    FullGradingSession,
    getGradingSession,
} from '@/pages/api/toGrade/session/[id]'
import { deserialize, serialize } from '@/utils/serialize.utils'

import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import AppLayout from '@/components/AppLayout'
import { CorrectStatus, Roles } from '@prisma/client'
import { GetServerSideProps } from 'next'
import GradingCard from '@/components/admin/GradingCard'
import GradingFinished from '@/components/admin/GradingFinished'
import HeadLayout from '@/components/HeadLayout'
import ProgressBar from '@/components/ProgressBar'
import React from 'react'
import { SuperJSONResult } from 'superjson/dist/types'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../server/authOptions'
import { useGradingSessionSWR } from '@/services/gradingSession/useGradingSessionSWR'
import { useRouter } from 'next/router'

const { Title } = Typography,
    { Item } = Breadcrumb

interface IGrade {
    gradingSession: SuperJSONResult
}

type GradingAnswerType =
    | FullGradingSession['answersToGrade'][number]
    | undefined

export const GradingContext = React.createContext<GradingAnswerType>(undefined)

const Grade = ({ gradingSession }: IGrade) => {
    const deserializedGrading = deserialize<FullGradingSession>(gradingSession)
    const {
        query: { id },
    } = useRouter()
    const ourGradingSession = useGradingSessionSWR({
        fallbackData: deserializedGrading,
        gradingSessionId: id?.toString(),
    })

    const currentAnswer = ourGradingSession?.answersToGrade?.find(
        a => a.id === ourGradingSession?.currentAnswer
    )

    const { back } = useRouter()
    return (
        <div>
            <HeadLayout title='Grade' />
            <AppLayout adminOnly={true}>
                <Row justify={'center'}>
                    <Col span={22}>
                        <PageHeader
                            breadcrumb={
                                <AdminBreadcrumb>
                                    <Item>Grade</Item>
                                    <Item>
                                        {currentAnswer?.question?.question}
                                    </Item>
                                </AdminBreadcrumb>
                            }
                            onBack={back}
                            title={
                                <Title
                                    level={1}
                                    style={{
                                        marginBottom: 0,
                                        whiteSpace: 'normal',
                                        wordWrap: 'normal',
                                    }}
                                >
                                    Grading
                                </Title>
                            }
                        />
                    </Col>
                    <Col span={22}>
                        <ProgressBar
                            percent={
                                ourGradingSession?.answersToGrade?.length
                                    ? (ourGradingSession.answersToGrade.filter(
                                          a =>
                                              a.isCorrect !==
                                              CorrectStatus.NEEDS_GRADED
                                      ).length /
                                          ourGradingSession.answersToGrade
                                              .length) *
                                      100
                                    : 0
                            }
                        />
                    </Col>
                    <Col span={22}>
                        <GradingContext.Provider value={currentAnswer}>
                            {ourGradingSession?.isComplete ? (
                                <GradingFinished />
                            ) : (
                                <GradingCard />
                            )}
                        </GradingContext.Provider>
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}

export default Grade

export const getServerSideProps: GetServerSideProps = async context => {
    const id = context.query.id
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    )
    if (
        session?.user?.role !== Roles.ADMIN ||
        !session.user.userId ||
        typeof id !== 'string'
    )
        return { notFound: true }
    const gradingSession = await getGradingSession(id, session.user.userId)
    if (!gradingSession) return { notFound: true }
    return {
        props: {
            gradingSession: serialize(gradingSession),
            session,
        },
    }
}
