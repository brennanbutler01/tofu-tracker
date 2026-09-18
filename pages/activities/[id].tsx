import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/authOptions'
import { Roles } from '@prisma/client'
import ActivityForm from '@/components/activities/ActivityForm'
import AppLayout from '@/components/AppLayout'
import HeadLayout from '@/components/HeadLayout'
import useSingleActivitySWR from '@/services/activities/useSingleActivitySWR'
import { deserialize, serialize } from '@/utils/serialize.utils'
import { HomeOutlined } from '@ant-design/icons'
import type { Activity } from '@prisma/client'
import { Breadcrumb, Col, PageHeader, Row, Typography } from 'antd'
import { GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { SuperJSONResult } from 'superjson/dist/types'
import { ActivityWithQuestion } from '../api/activities'
import { getActivity } from '../api/activities/[id]'
const { Title } = Typography

interface IActivity {
    activity: SuperJSONResult
}

const Activity = ({ activity }: IActivity) => {
    const ourActivity = useSingleActivitySWR({
        fallbackData: deserialize<ActivityWithQuestion>(activity),
    })
    const { back } = useRouter()

    return (
        <div>
            <HeadLayout title='Edit Activity' />
            <AppLayout adminOnly>
                <PageHeader
                    breadcrumb={
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <Link legacyBehavior href='/'>
                                    <a>
                                        <HomeOutlined />
                                    </a>
                                </Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>Edit</Breadcrumb.Item>
                            <Breadcrumb.Item>
                                {ourActivity?.title}
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    }
                    title={
                        <Title level={1} style={{ marginBottom: 0 }}>
                            Edit
                        </Title>
                    }
                    onBack={back}
                />
                <Row justify='center'>
                    <Col span={22} sm={20} md={16} lg={14} xl={12}>
                        <ActivityForm />
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}
export default Activity

export const getServerSideProps = async (
    context: import('next').GetServerSidePropsContext
) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    )
    if (session?.user?.role !== Roles.ADMIN) return { notFound: true }
    if (typeof context.query.id !== 'string') return { notFound: true }
    const activity = await getActivity(context.query.id)
    if (!activity) return { notFound: true }
    return { props: { activity: serialize(activity), session } }
}
