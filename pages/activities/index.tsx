import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/authOptions'
import { Roles } from '@prisma/client'
import ActivityTabs from '@/components/activities/ActivityTabs'
import AppLayout from '@/components/AppLayout'
import HeadLayout from '@/components/HeadLayout'
import { useActivitySWR } from '@/services/activities/useActivitySWR'
import { deserialize } from '@/utils/serialize.utils'
import { Activity } from '@prisma/client'
import { Col, PageHeader, Row, Typography } from 'antd'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { serialize } from 'superjson'
import { SuperJSONResult } from 'superjson/dist/types'
import { ActivityWithQuestion, getActivities } from '../api/activities'
const { Title } = Typography

interface IActivities {
    activities: SuperJSONResult
}

const Activities = ({ activities }: IActivities) => {
    const { back } = useRouter()
    useActivitySWR({
        fallbackData: deserialize<ActivityWithQuestion[]>(activities),
    })

    return (
        <div>
            <HeadLayout title='Activities' />
            <AppLayout adminOnly>
                <Row>
                    <Col span={24}>
                        <PageHeader
                            onBack={back}
                            title={<Title level={1}>Activities</Title>}
                            footer={<ActivityTabs />}
                        />
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}

export default Activities

export const getServerSideProps = async (
    context: import('next').GetServerSidePropsContext
) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    )
    if (session?.user?.role !== Roles.ADMIN) return { notFound: true }
    const activities = await getActivities()
    return { props: { activities: serialize(activities), session } }
}
