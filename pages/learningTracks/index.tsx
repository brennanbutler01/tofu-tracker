import { PageHeader, Typography } from 'antd'

import AppLayout from '@/components/AppLayout'
import HeadLayout from '@/components/HeadLayout'
import { LearningTrackBreadcrumb } from '@/components/learningTracks/LearningTrackBreadcrumb'
import LearningTrackTabs from '@/components/learningTracks/LearningTrackTabs'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { LearningTrack } from '@prisma/client'
import {
    getLearningTracks,
    LearningTrackWithOrderedCourses,
} from '@/pages/api/learningTracks'
import { deserialize, serialize } from '@/utils/serialize.utils'
import { SuperJSONResult } from 'superjson/dist/types'
import { useLearningTrackSWR } from '@/services/learningTrack/useLearningTrackSWR'

const { Title } = Typography

interface ILearningTracks {
    tracks: SuperJSONResult
}

const LearningTracks = ({ tracks }: ILearningTracks) => {
    const ourTracks = useLearningTrackSWR({
        fallbackData:
            deserialize<Array<LearningTrackWithOrderedCourses>>(tracks),
    })

    console.log('our tracks', ourTracks)

    const { back } = useRouter()
    return (
        <div>
            <HeadLayout title='Learning Tracks' />
            <AppLayout adminOnly>
                <PageHeader
                    onBack={back}
                    breadcrumb={<LearningTrackBreadcrumb />}
                    title={
                        <Title
                            style={{
                                marginBottom: 0,
                                whiteSpace: 'normal',
                                wordWrap: 'normal',
                            }}
                            level={1}
                        >
                            Learning Tracks
                        </Title>
                    }
                    footer={<LearningTrackTabs />}
                />
            </AppLayout>
        </div>
    )
}
export default LearningTracks

export const getServerSideProps: GetServerSideProps = async context => {
    let tracks: Array<LearningTrack> = []
    try {
        tracks = await getLearningTracks()
    } catch (err) {
        console.log('There was an error trying to get the learning tracks', err)
    }
    return {
        props: {
            tracks: serialize(tracks),
        },
    }
}
