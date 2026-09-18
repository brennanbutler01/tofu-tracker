import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/authOptions'
import { Roles } from '@prisma/client'
import { GetServerSideProps } from 'next'
import { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'
import { findOneTrack } from '@/pages/api/learningTracks/[id]'
import { deserialize, serialize } from '@/utils/serialize.utils'
import { SuperJSONResult } from 'superjson/dist/types'
import { useEditLearningTrackSWR } from '@/services/learningTrack/useEditLearningTrackSWR'
import HeadLayout from '@/components/HeadLayout'
import AppLayout from '@/components/AppLayout'
import {
    Breadcrumb,
    Col,
    Grid,
    PageHeader,
    Row,
    Space,
    Tooltip,
    Typography,
} from 'antd'
import { useRouter } from 'next/router'
import { LearningTrackBreadcrumb } from '@/components/learningTracks/LearningTrackBreadcrumb'
import Link from 'next/link'
import { StyledTag } from '@/components/decks/DeckTags'
import dayjs, { formatDate } from '@/utils/dayjs'
import { useTheme } from 'styled-components'
import TrackForm from '@/components/learningTracks/TrackForm'
const { Title } = Typography,
    { Item } = Breadcrumb

interface IEditTrack {
    track: SuperJSONResult
}

const EditTrack = ({ track }: IEditTrack) => {
    const ourTrack = useEditLearningTrackSWR({
        fallbackData: deserialize<LearningTrackWithOrderedCourses>(track),
    })
    const { back } = useRouter()
    const theme = useTheme()
    const breakpoint = Grid.useBreakpoint()

    const editTrackTags = [
        <Tooltip
            key={'created'}
            title={`Created at ${formatDate(ourTrack.created)}`}
        >
            <StyledTag color={theme['tofu-green-background']}>
                Created: {dayjs(ourTrack.created).fromNow()}
            </StyledTag>
        </Tooltip>,
        <Tooltip
            key={'updated'}
            title={`Updated at ${formatDate(ourTrack.updatedAt)}`}
        >
            <StyledTag color={theme['tofu-purple']}>
                Updated: {dayjs(ourTrack.updatedAt).fromNow()}
            </StyledTag>
        </Tooltip>,
    ]

    return (
        <div>
            <HeadLayout title={'Edit Learning Track'} />
            <AppLayout adminOnly>
                <PageHeader
                    title={
                        <Space style={{ width: '100%' }} direction={'vertical'}>
                            <Title
                                level={1}
                                style={{
                                    marginBottom: 0,
                                    whiteSpace: 'normal',
                                    wordWrap: 'normal',
                                }}
                            >
                                {ourTrack.title}
                            </Title>
                            {!breakpoint.md && editTrackTags}
                        </Space>
                    }
                    onBack={back}
                    {...(breakpoint.md && { tags: editTrackTags })}
                    breadcrumb={
                        <LearningTrackBreadcrumb>
                            <Item>Edit</Item>
                            <Link
                                legacyBehavior
                                href={`/learningTracks/edit/${ourTrack.id}`}
                            >
                                <a>
                                    <Item>{ourTrack.title}</Item>
                                </a>
                            </Link>
                        </LearningTrackBreadcrumb>
                    }
                />
                <Row justify={'center'}>
                    <Col span={22}>
                        <TrackForm editingTrack={ourTrack} />
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}
export default EditTrack

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
    const track = await findOneTrack(context.query.id)
    if (!track) return { notFound: true }
    return { props: { track: serialize(track), session } }
}
