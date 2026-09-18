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
            <AppLayout>
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
                            <Link legacyBehavior href={`/learningTracks/edit/${ourTrack.id}`}>
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

export const getServerSideProps: GetServerSideProps = async context => {
    const { query } = context
    let track: LearningTrackWithOrderedCourses | null = null

    try {
        track = await findOneTrack(query.id as string)
    } catch (err) {
        console.log(
            'There was an error in trying to get this learning track',
            err
        )
    }
    return {
        props: {
            track: serialize(track),
        },
    }
}
