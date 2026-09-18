import { getServerSession } from 'next-auth'
import { authOptions } from 'server/authOptions'
import {
    Breadcrumb,
    Grid,
    PageHeader,
    Space,
    Statistic,
    Typography,
} from 'antd'
import {
    GameWithFullOptions,
    getGameWithFullOptions,
} from '@/pages/api/games/[id]'
import { deserialize, serialize } from '@/utils/serialize.utils'

import AppLayout from '@/components/AppLayout'
import { GetServerSideProps } from 'next'
import HeadLayout from '@/components/HeadLayout'
import { PlayBreadcrumb } from '@/components/game/PlayBreadcrumb'
import Quiz from '@/components/game/Quiz'
import QuizResults from '@/components/game/QuizResults'
import { SuperJSONResult } from 'superjson/dist/types'
import TimestampTag from '@/components/TimestampTag'
import { getSession } from 'next-auth/react'
import { useGamesSWR } from '@/services/games/useGamesSWR'
import { useRouter } from 'next/router'

const { Title } = Typography,
    { Item } = Breadcrumb

interface IGame {
    game: SuperJSONResult
}

const Game = ({ game }: IGame) => {
    const ourGame = deserialize<GameWithFullOptions>(game)
    const {
        back,
        query: { id },
    } = useRouter()

    const swrGame = useGamesSWR(id as string, ourGame)
    const breakpoint = Grid.useBreakpoint()

    return (
        <div>
            <HeadLayout title={`Game Session - ${swrGame?.title}`} />
            <AppLayout adminOnly={false}>
                <PageHeader
                    breadcrumb={
                        <PlayBreadcrumb>
                            <Item>Game</Item>
                            <Item>{swrGame?.title}</Item>
                        </PlayBreadcrumb>
                    }
                    onBack={() => back()}
                    title={
                        <Title
                            level={1}
                            style={{
                                marginBottom: 0,
                                whiteSpace: 'normal',
                                wordWrap: 'normal',
                            }}
                        >
                            Game
                        </Title>
                    }
                    subTitle={
                        breakpoint.sm && (
                            <TimestampTag date={swrGame?.started} />
                        )
                    }
                    footer={
                        swrGame?.isComplete ? null : (
                            <Space size={'large'}>
                                <Statistic
                                    title={'Current Question'}
                                    value={swrGame?.currentQuestion}
                                    suffix={` / ${swrGame?.questions?.length}`}
                                />
                                <Statistic
                                    title={'# Correct'}
                                    value={swrGame?.numberCorrect}
                                    suffix={` / ${swrGame?.answerHistory?.length}`}
                                />
                            </Space>
                        )
                    }
                />
                {swrGame?.isComplete ? <QuizResults /> : <Quiz />}
            </AppLayout>
        </div>
    )
}
export default Game

// noinspection JSUnusedGlobalSymbols
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
    const record = await getGameWithFullOptions(id, session.user.userId)
    if (!record) return { notFound: true }
    return { props: { game: serialize(record), session } }
}
