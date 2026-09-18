import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/authOptions'
import { Roles } from '@prisma/client'
import { CourseWithDecks, getCourses } from '../api/courses'
import { PageHeader, Typography } from 'antd'
import { deserialize, serialize } from '@/utils/serialize.utils'

import AppLayout from '@/components/AppLayout'
import { Course } from '@prisma/client'
import { CourseBreadcrumb } from '@/components/courses/CourseBreadcrumb'
import CourseTabs from '@/components/courses/CourseTabs'
import { GetServerSideProps } from 'next'
import HeadLayout from '@/components/HeadLayout'
import { SuperJSONResult } from 'superjson/dist/types'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'
import { useRouter } from 'next/router'

const { Title, Text } = Typography

interface ICourses {
    courses: SuperJSONResult
}

const Courses = ({ courses }: ICourses) => {
    const { push } = useRouter()
    const ourCourses = deserialize<Array<CourseWithDecks>>(courses)
    useCoursesSWR({ fallbackData: ourCourses })

    return (
        <>
            <HeadLayout title='Courses' />

            <AppLayout adminOnly={true}>
                <PageHeader
                    breadcrumb={<CourseBreadcrumb />}
                    title={
                        <Title
                            level={1}
                            style={{
                                marginBottom: 0,
                                whiteSpace: 'normal',
                                wordWrap: 'normal',
                            }}
                        >
                            Courses{' '}
                        </Title>
                    }
                    extra={<Text type={'secondary'}>Manage Courses here</Text>}
                    onBack={async () => await push('/')}
                    footer={<CourseTabs />}
                />
            </AppLayout>
        </>
    )
}

export default Courses

export const getServerSideProps = async (
    context: import('next').GetServerSidePropsContext
) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    )
    if (session?.user?.role !== Roles.ADMIN) return { notFound: true }
    const courses = await getCourses()
    return { props: { courses: serialize(courses), session } }
}
