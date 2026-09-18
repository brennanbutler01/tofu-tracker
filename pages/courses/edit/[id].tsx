import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/authOptions'
import { Roles } from '@prisma/client'
import {
    Breadcrumb,
    Col,
    Grid,
    PageHeader,
    Row,
    Space,
    Spin,
    Tooltip,
    Typography,
} from 'antd'
import { deserialize, serialize } from '@/utils/serialize.utils'

import AppLayout from '@/components/AppLayout'
import { Course } from '@prisma/client'
import { CourseBreadcrumb } from '@/components/courses/CourseBreadcrumb'
import CourseForm from '@/components/courses/CourseForm'
import { CourseWithDecks } from '@/pages/api/courses'
import { GetServerSideProps } from 'next'
import HeadLayout from '@/components/HeadLayout'
import { StyledTag } from '@/components/decks/DeckTags'
import { SuperJSONResult } from 'superjson/dist/types'
import dayjs from '@/utils/dayjs'
import { getCourse } from '@/pages/api/courses/[id]'
import { useEditCourseSWR } from '@/services/courses/useEditCourseSWR'
import { useRouter } from 'next/router'
import { useTheme } from 'styled-components'

const { Title } = Typography,
    { Item } = Breadcrumb

interface IEditCourse {
    course: SuperJSONResult
}

const EditCourse = ({ course }: IEditCourse) => {
    const ourCourse = deserialize<CourseWithDecks>(course)
    const { back, pathname } = useRouter()
    const swrCourse = useEditCourseSWR({ fallbackData: ourCourse })
    const title = swrCourse ? swrCourse.title : ''
    const theme = useTheme()
    const breakpoint = Grid.useBreakpoint()

    const tags = [
        <Tooltip
            key='created'
            title={dayjs(swrCourse?.created).format('MM/DD/YYYY')}
        >
            <StyledTag color={theme['tofu-purple']}>
                Created: {dayjs(swrCourse?.created).fromNow()}
            </StyledTag>
        </Tooltip>,
        <Tooltip
            key='updated'
            title={dayjs(swrCourse?.updatedAt).format('MM/DD/YYYY')}
        >
            <StyledTag color={theme['tofu-green-background']}>
                Last Updated: {dayjs(swrCourse?.updatedAt).fromNow()}
            </StyledTag>
        </Tooltip>,
        <StyledTag key='level' color={theme['tofu-brand-1']}>
            Level: {swrCourse?.level}
        </StyledTag>,
    ]

    return (
        <div>
            <HeadLayout />
            <AppLayout adminOnly>
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
                            {title || <Spin tip='Searching for Course' />}
                        </Title>
                    }
                    {...(swrCourse && {
                        footer: (
                            <Space
                                style={{ marginBottom: '15px' }}
                                direction={
                                    breakpoint.md ? 'horizontal' : 'vertical'
                                }
                            >
                                {tags}
                            </Space>
                        ),
                    })}
                    breadcrumb={
                        <CourseBreadcrumb>
                            <Item>Edit</Item>
                            <Item href={pathname}>{title}</Item>
                        </CourseBreadcrumb>
                    }
                />
                <Row justify={'center'}>
                    <Col span={20}>
                        <CourseForm editingCourse={swrCourse} />
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}
export default EditCourse

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
    const course = await getCourse(context.query.id)
    if (!course) return { notFound: true }
    return { props: { course: serialize(course), session } }
}
