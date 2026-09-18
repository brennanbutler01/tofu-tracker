import { getServerSession } from 'next-auth'
import { authOptions } from 'server/authOptions'
import HeadLayout from '@/components/HeadLayout'
import AppLayout from '@/components/AppLayout'
import { PageHeader, Typography } from 'antd'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import {
    FullCourseSession,
    getCourseSession,
} from '@/pages/api/courseSession/[id]'
import { deserialize, serialize } from '@/utils/serialize.utils'
import { SuperJSONResult } from 'superjson/dist/types'
import { useSingularCourseSessionSWR } from '@/services/courseSession/useSingularCourseSessionSWR'
import Quiz from '@/components/game/Quiz'
import QuizResults from '@/components/game/QuizResults'
import { useSWRConfig } from 'swr'
const { Title } = Typography

interface IStudyCourseSession {
    session: SuperJSONResult
}

const StudyCourseSession = ({ session }: IStudyCourseSession) => {
    const { back, query } = useRouter()
    const fallback = deserialize<FullCourseSession>(session)

    const courseSession = useSingularCourseSessionSWR({
        fallbackData: fallback,
        id: query.id as string,
    })

    return (
        <div>
            <HeadLayout title={'Play'} />
            <AppLayout>
                <PageHeader
                    onBack={back}
                    title={
                        <Title
                            level={1}
                            style={{
                                marginBottom: 0,
                                whiteSpace: 'break-spaces',
                            }}
                        >
                            Studying
                        </Title>
                    }
                />
                {courseSession.isComplete ? (
                    <QuizResults type={'course'} />
                ) : (
                    <Quiz type={'course'} />
                )}
            </AppLayout>
        </div>
    )
}
export default StudyCourseSession

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
    const record = await getCourseSession(id, session.user.userId)
    if (!record) return { notFound: true }
    return { props: { session: serialize(record) } }
}
