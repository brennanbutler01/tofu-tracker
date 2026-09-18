import { Button, Empty, Space, Tabs, Typography } from 'antd'
import GameHistory from '@/components/game/GameHistory'
import { GameWithOptions } from '@/pages/api/games/unfinished'
import styled from 'styled-components'
import GradedResponse from '@/components/game/gradedResponse/GradedResponse'
import React from 'react'
import { useDecksSWR } from '@/services/decks/useDecksSWR'
import { Question } from '@prisma/client'
const { TabPane } = Tabs,
    { Title } = Typography

interface StartGame {
    startGame: () => Promise<void>
    loading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

interface IPlayTabs extends StartGame {
    unfinishedGames: Array<GameWithOptions>
    finishedGames: Array<GameWithOptions>
}

const StyledTabPane = styled(TabPane)`
    margin-top: 5vh;
`

enum TabGameTypes {
    UNFINISHED = 'unfinished',
    FINISHED = 'finished',
}

interface IGameEmpty extends StartGame {
    type: TabGameTypes
    data: Array<GameWithOptions>
}

const EmptyContainer = styled.div`
    .ant-btn[disabled] {
        color: rgba(232, 230, 227, 0.25);
        border-color: rgb(99, 92, 82);
        background-color: rgb(30, 32, 33);
        background-image: none;
        text-shadow: none;
        box-shadow: none;
    }
`

const GameEmpty = ({
    type,
    data,
    startGame,
    loading,
    setLoading,
}: IGameEmpty) => {
    const decks = useDecksSWR()
    const deckQuestions = decks?.reduce((acc, curr) => {
        if (curr.questions.length === 0) {
            return acc
        }
        return [...acc, ...curr.questions]
    }, [] as Array<Question>)
    return data?.length === 0 ? (
        <EmptyContainer>
            <Empty
                description={
                    <Space direction={'vertical'}>
                        <Title level={3}>
                            No {type} games. Play a new one.
                        </Title>
                        <Button
                            onClick={startGame}
                            loading={loading}
                            disabled={deckQuestions?.length === 0}
                        >
                            Begin a new game
                        </Button>
                    </Space>
                }
            />
        </EmptyContainer>
    ) : (
        <GameHistory data={data} loading={loading} setLoading={setLoading} />
    )
}

const PlayTabs = ({
    unfinishedGames,
    finishedGames,
    startGame,
    loading,
    setLoading,
}: IPlayTabs) => {
    return (
        <Tabs>
            <StyledTabPane tab={'Unfinished'} key={'unfinished'}>
                <GameEmpty
                    type={TabGameTypes.UNFINISHED}
                    data={unfinishedGames}
                    startGame={startGame}
                    loading={loading}
                    setLoading={setLoading}
                />
            </StyledTabPane>
            <StyledTabPane tab={'Recently completed'} key={'finished'}>
                <GameEmpty
                    type={TabGameTypes.FINISHED}
                    data={finishedGames}
                    startGame={startGame}
                    loading={loading}
                    setLoading={setLoading}
                />
            </StyledTabPane>
            <StyledTabPane tab={'Graded Responses'} key={'graded'}>
                <GradedResponse />
            </StyledTabPane>
        </Tabs>
    )
}

export default PlayTabs
