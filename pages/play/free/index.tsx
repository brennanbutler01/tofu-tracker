import {
    DecksWithQuestionOptions,
    getDecksWithQuestionOptions,
} from '@/pages/api/decks/game'
import {
    Breadcrumb,
    Form,
    Grid,
    InputRef,
    PageHeader,
    Space,
    TreeDataNode,
    Typography,
} from 'antd'
import {
    GameWithOptions,
    getFinishedGames,
    getUnfinishedGames,
} from '@/pages/api/games/unfinished'
import {
    GradedUserResponse,
    getGradedResponsesForUser,
} from '@/pages/api/graded'
import { deserialize, serialize } from '@/utils/serialize.utils'
import { useCallback, useEffect, useRef, useState } from 'react'

import AppLayout from '@/components/AppLayout'
import GameConfiguration from '@/components/game/GameConfiguration'
import { GameTitleModal } from '@/components/game/GameTitleModal'
import { GetServerSidePropsContext } from 'next'
import HeadLayout from '@/components/HeadLayout'
import { PlayBreadcrumb } from '@/components/game/PlayBreadcrumb'
import PlayConfigButtons from '@/components/game/PlayConfigButtons'
import PlayTabs from '@/components/game/PlayTabs'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import { SuperJSONResult } from 'superjson/dist/types'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/authOptions'
import prisma from '@/prisma/prisma'
import { useGameCRUD } from '@/services/games/useGameCRUD'
import { useGameDeckSWR } from '@/services/decks/game/useGameDeckSWR'
import { useGradedResponsesSWR } from '@/services/useGradedResponsesSWR'
import { useRouter } from 'next/router'
import { useUnfinishedGamesSWR } from '@/services/games/unfinishedGames/useUnfinishedGamesSWR'

const { Title, Text } = Typography,
    { Item } = Breadcrumb

interface IPlay {
    decks: SuperJSONResult
    unfinishedGames: SuperJSONResult
    finishedGames: SuperJSONResult
    gradedResponses: SuperJSONResult
}

const Index = ({
    decks,
    gradedResponses,
    unfinishedGames,
    finishedGames,
}: IPlay) => {
    const swrDecks = useGameDeckSWR(
        deserialize<Array<DecksWithQuestionOptions>>(decks)
    )
    const incompleteGames = useUnfinishedGamesSWR(
        deserialize<Array<GameWithOptions>>(unfinishedGames)
    )
    const completedGames = deserialize<Array<GameWithOptions>>(finishedGames)
    useGradedResponsesSWR(
        deserialize<Array<GradedUserResponse>>(gradedResponses)
    )

    const [configurationVisible, setConfigurationVisible] = useState(false)
    const toggleConfiguration = () =>
        setConfigurationVisible(!configurationVisible)
    const ourDecks = useGameDeckSWR(swrDecks)
    const { push, back } = useRouter()
    const [timeValue, setTimeValue] = useState(0)

    const [selectedData, setSelectedData] = useState<Array<TreeDataNode>>([])
    const [sliderValue, setSliderValue] = useState(0)
    const [loadingGame, setLoadingGame] = useState(false)
    const breakpoint = Grid.useBreakpoint()

    useEffect(() => {
        setSelectedData(
            ourDecks?.map(deck => ({
                title: deck.title,
                value: `d-${deck.id}`,
                key: deck.id,
                children: deck.questions.map(question => ({
                    title: question.question,
                    value: `q-${question.id}`,
                    key: question.id,
                    parentId: deck.id,
                })),
            }))
        )
    }, [ourDecks])

    //iterate through all of our decks and add up our questions. wrap w/ useCallback, so we don't run the useEffect every render.
    const sumOfDeckQuestions = useCallback(
        () =>
            ourDecks?.reduce((acc, curr) => {
                return acc + curr?.questions?.length
            }, 0),
        [ourDecks]
    )

    const [questionCount, setQuestionCount] = useState(0)
    const questionsEmpty = questionCount === 0

    useEffect(() => {
        setQuestionCount(sumOfDeckQuestions())
    }, [sumOfDeckQuestions])

    const { createGameSession } = useGameCRUD()

    const filteredQuestions = useCallback(
        () =>
            selectedData?.reduce((acc, curr) => {
                // get rid of the q or d - prefix that we added to distinguish between questions and decks
                const parsedId = curr.toString().substring(2)

                //if we are looking for a deck
                if (curr?.toString().includes('d-')) {
                    //find the deck, add all of its questions
                    return [
                        ...acc,
                        ...(ourDecks.find(d => d.id === parsedId)?.questions ||
                            []),
                    ]
                } else {
                    //else it is a question we are looking for, so we have eto go through all the decks until we find the question we are looking for!
                    const ourQuestion = ourDecks?.reduce((acc, deck) => {
                        //if we haven't found our question, then we need to keep looking
                        if (!acc) {
                            return deck?.questions?.find(q => q.id === parsedId)
                        }
                        return acc
                    }, undefined as undefined | QuestionWithOptions)
                    return ourQuestion ? [...acc, ourQuestion] : acc
                }
            }, [] as Array<QuestionWithOptions>),
        [ourDecks, selectedData]
    )

    const [form] = Form.useForm<{ title: string }>()
    const inputRef = useRef<InputRef>(null)

    const startGame = async () => {
        const filteredQuestionArr = filteredQuestions()
        const allQuestions = ourDecks?.reduce(
            (acc, curr) => [...acc, ...curr.questions],
            [] as Array<QuestionWithOptions>
        )

        GameTitleModal({
            form,
            //if we have a question that matches our filter, we will use those. else we will just return all of them
            questions:
                filteredQuestionArr.length > 0
                    ? filteredQuestionArr
                    : allQuestions,
            setLoadingGame,
            push,
            createGameSession,
            ref: inputRef,
        })

        setTimeout(() => {
            inputRef?.current?.focus({})
        }, 250)
    }

    return (
        <div>
            <HeadLayout title='Play' />
            <AppLayout adminOnly={false}>
                <PageHeader
                    onBack={back}
                    breadcrumb={
                        <PlayBreadcrumb>
                            <Item href={'/play/free'}>Free Play</Item>
                        </PlayBreadcrumb>
                    }
                    footer={
                        <Space
                            direction={'vertical'}
                            style={{ width: '100%' }}
                            size={'large'}
                        >
                            {breakpoint.xs && (
                                <PlayConfigButtons
                                    questionsEmpty={questionsEmpty}
                                    startGame={startGame}
                                    toggleConfiguration={() =>
                                        setConfigurationVisible(
                                            !configurationVisible
                                        )
                                    }
                                    loading={loadingGame}
                                />
                            )}
                            <PlayTabs
                                unfinishedGames={incompleteGames}
                                finishedGames={completedGames}
                                startGame={startGame}
                                loading={loadingGame}
                                setLoading={setLoadingGame}
                            />
                        </Space>
                    }
                    title={
                        <Title
                            level={1}
                            style={{
                                marginBottom: 0,
                                whiteSpace: 'normal',
                                wordWrap: 'normal',
                            }}
                        >
                            Play a Game!
                        </Title>
                    }
                    subTitle={
                        breakpoint.sm && (
                            <Text type={'secondary'}>
                                {questionsEmpty
                                    ? 'Please create a question for a deck in order to play a game!'
                                    : 'Click the play game button to begin! '}
                            </Text>
                        )
                    }
                    extra={
                        breakpoint.sm && (
                            <PlayConfigButtons
                                questionsEmpty={questionsEmpty}
                                startGame={startGame}
                                toggleConfiguration={toggleConfiguration}
                                loading={loadingGame}
                            />
                        )
                    }
                >
                    {configurationVisible && (
                        <GameConfiguration
                            selectedData={selectedData}
                            setSelectedData={setSelectedData}
                            timeValue={timeValue}
                            setTimeValue={setTimeValue}
                            sliderValue={sliderValue}
                            setSliderValue={setSliderValue}
                        />
                    )}
                </PageHeader>
            </AppLayout>
        </div>
    )
}
export default Index

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    )
    if (!session?.user?.userId)
        return { redirect: { destination: '/auth/signin', permanent: false } }
    let decks: Array<DecksWithQuestionOptions> = []
    let unfinishedGames: Array<GameWithOptions> = []
    let finishedGames: Array<GameWithOptions> = []
    let gradedResponses: Array<GradedUserResponse> = []

    try {
        gradedResponses = await getGradedResponsesForUser(
            session?.user?.userId as string
        )
    } catch (err) {
        console.log('Error getting graded responses ', err)
    }

    try {
        decks = await getDecksWithQuestionOptions(session.user.userId)
    } catch (err) {
        console.log(`Error getting decks... ${err}`)
    }

    try {
        unfinishedGames = await getUnfinishedGames(
            session?.user?.userId as string
        )
    } catch (err) {
        console.log(`Error getting games... ${err}`)
    }

    try {
        finishedGames = await getFinishedGames(session?.user?.userId as string)
    } catch (err) {
        console.log(`Error getting finished games... ${err}`)
    }

    return {
        props: {
            decks: serialize(decks),
            unfinishedGames: serialize(unfinishedGames),
            finishedGames: serialize(finishedGames),
            gradedResponses: serialize(gradedResponses),
            session,
        },
    }
}
