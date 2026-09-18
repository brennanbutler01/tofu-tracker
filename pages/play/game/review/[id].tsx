import { getServerSession } from 'next-auth'
import { authOptions } from 'server/authOptions'
import { Breadcrumb, Col, PageHeader, Row, Skeleton, Typography } from 'antd'
import {
    GameWithFullOptions,
    getGameWithFullOptions,
} from '@/pages/api/games/[id]'
import ResultsSegment, { AnswerFilter } from '@/components/game/ResultsSegment'
import { deserialize, serialize } from '@/utils/serialize.utils'

import AppLayout from '@/components/AppLayout'
import { GetServerSideProps } from 'next'
import HeadLayout from '@/components/HeadLayout'
import { PlayBreadcrumb } from '@/components/game/PlayBreadcrumb'
import ResultAnswerCard from '@/components/game/ResultAnswerCard'
import { SuperJSONResult } from 'superjson/dist/types'
import { getSession } from 'next-auth/react'
import styled from 'styled-components'
import { useGamesSWR } from '@/services/games/useGamesSWR'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface IGame {
    game: SuperJSONResult
}

const { Title } = Typography,
    { Item } = Breadcrumb

const ListContainer = styled.div`
    .ant-radio-input:focus + .ant-radio-inner {
        box-shadow: 0 0 0 2px ${props => props.theme['tofu-brand-4']};
    }

    .ant-radio-disabled .ant-radio-inner::after {
        background-color: ${props => props.theme['tofu-green']};
    }
    .ant-radio-disabled .ant-radio-inner {
        background-color: ${props => props.theme['tofu-brand-0']};
        border-color: rgb(99, 92, 82) !important;
    }
`

const Game = ({ game }: IGame) => {
    const ourGame = deserialize<GameWithFullOptions>(game)
    const { back } = useRouter()

    const {
        query: { id },
    } = useRouter()
    const swrGame = useGamesSWR(id as string, ourGame)
    const [answerFilter, setAnswerFilter] = useState<AnswerFilter>('All')

    return (
        <ListContainer>
            <HeadLayout title={`Game Session: ${swrGame?.title}`} />
            <AppLayout>
                <PageHeader
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
                            Reviewing Game
                        </Title>
                    }
                    breadcrumb={
                        <PlayBreadcrumb>
                            <Item>Review</Item>
                            <Item>{swrGame.title}</Item>
                        </PlayBreadcrumb>
                    }
                />
                <Row justify={'center'}>
                    <Col span={22}>
                        <ResultsSegment setOption={setAnswerFilter} />
                    </Col>
                    <Col span={22}>
                        <Skeleton active loading={!swrGame}>
                            <ResultAnswerCard answerFilter={answerFilter} />
                        </Skeleton>
                    </Col>
                </Row>
            </AppLayout>
        </ListContainer>
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
    return { props: { game: serialize(record) } }
}
