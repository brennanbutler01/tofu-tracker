import { getServerSession } from 'next-auth'
import { authOptions } from 'server/authOptions'
import PlayActivityBreadcrumb from '@/components/activities/PlayActivityBreadcrumb'
import AppLayout from '@/components/AppLayout'
import Quiz from '@/components/game/Quiz'
import QuizResults from '@/components/game/QuizResults'
import HeadLayout from '@/components/HeadLayout'
import { FullActivitySession } from '@/pages/api/activitySession'
import { getActivitySession } from '@/pages/api/activitySession/[id]'
import { useSingleActivitySessionSWR } from '@/services/activitySession/useSingleActivitySessionSWR'
import { deserialize, serialize } from '@/utils/serialize.utils'
import { Breadcrumb, Col, PageHeader, Row, Typography } from 'antd'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { SuperJSONResult } from 'superjson/dist/types'
const { Title } = Typography,
    { Item } = Breadcrumb

interface IPlayActivity {
    activitySession: SuperJSONResult
}

const PlayActivity = ({ activitySession }: IPlayActivity) => {
    const { back, query } = useRouter()
    const { data: ourActivitySession } = useSingleActivitySessionSWR({
        fallbackData: deserialize<FullActivitySession>(activitySession),
    })

    const thisGame = ourActivitySession?.gameSession

    return (
        <div>
            <HeadLayout title='Play Activity' />
            <AppLayout>
                <PageHeader
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
                            Play {}
                        </Title>
                    }
                    breadcrumb={
                        <PlayActivityBreadcrumb>
                            <Item>{ourActivitySession?.activity?.title}</Item>
                        </PlayActivityBreadcrumb>
                    }
                />

                <Row justify='center'>
                    <Col span={24}>
                        {thisGame?.isComplete ? (
                            <QuizResults type='activity' />
                        ) : (
                            <Quiz type='activity' />
                        )}
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}

export default PlayActivity

export const getServerSideProps = async (
    context: import('next').GetServerSidePropsContext
) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    )
    if (!session?.user?.userId)
        return { redirect: { destination: '/auth/signin', permanent: false } }
    const id = context.query.id
    if (typeof id !== 'string') return { notFound: true }
    const record = await getActivitySession(id, session.user.userId)
    if (!record) return { notFound: true }
    return { props: { activitySession: serialize(record) } }
}
