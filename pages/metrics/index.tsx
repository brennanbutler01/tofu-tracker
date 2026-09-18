import { Col, PageHeader, Row, Typography } from 'antd'

import AppLayout from '@/components/AppLayout'
import { GetServerSidePropsContext } from 'next'
import { MetricsBreadcrumbs } from '@/components/metrics/MetricsBreadcrumbs'
import React, { useState } from 'react'
import { getServerSession } from 'next-auth/next'
import { Roles } from '@prisma/client'
import { authOptions } from '@/server/authOptions'
import { useRouter } from 'next/router'
import QueryList, { Query } from '@/components/metrics/QueryList'
import HeadLayout from '@/components/HeadLayout'
import { StyledCard } from '@/components/game/QuizCard'
import AnswersByDay from '@/components/metrics/AnswersByDay'
import PerformanceByCourse from '@/components/metrics/PerformanceByCourse'
import { QuestionStats } from '@/components/metrics/QuestionStats'

const { Title } = Typography

const Metrics = () => {
    const { push } = useRouter()
    const [query, setCurrentQuery] = useState<Query>(Query.None)

    return (
        <div>
            <HeadLayout title={'Metrics'} />
            <AppLayout adminOnly={true}>
                <PageHeader
                    breadcrumb={<MetricsBreadcrumbs />}
                    title={
                        <Title
                            level={1}
                            style={{
                                marginBottom: 0,
                                whiteSpace: 'nowrap',
                                fontSize: 32,
                                wordWrap: 'normal',
                            }}
                        >
                            Metrics
                        </Title>
                    }
                    onBack={async () => await push('/')}
                />
                <Row justify='center'>
                    <Col span={24} md={20} lg={18} xxl={16}>
                        <QueryList setCurrentQuery={setCurrentQuery} />
                        <StyledCard>
                            {query === Query.AnswersByDay ? (
                                <AnswersByDay />
                            ) : query === Query.Courses ? (
                                <PerformanceByCourse />
                            ) : query === Query.QuestionStats ? (
                                <QuestionStats />
                            ) : (
                                'Select a report above to view results.'
                            )}
                        </StyledCard>
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}

export default Metrics

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    )
    if (session?.user?.role !== Roles.ADMIN) return { notFound: true }
    return {
        props: {
            session,
        },
    }
}
