import { Breadcrumb, Grid, PageHeader, Space, Typography } from 'antd'
import { deserialize, serialize } from '@/utils/serialize.utils'

import AppLayout from '@/components/AppLayout'
import { DeckBreadcrumb } from '@/decks/DeckBreadcrumb'
import DeckTags from '@/decks/DeckTags'
import { GetServerSidePropsContext } from 'next'
import HeadLayout from '@/components/HeadLayout'
import { Prisma } from '@prisma/client'
import QuestionTabs from '@/questions/QuestionTabs'
import React from 'react'
import { SuperJSONResult } from 'superjson/dist/types'
import { getDeckQuestions } from '@/pages/api/decks/questions/[...path]'
import { getSession } from 'next-auth/react'
import { useDeckQuestionsSWR } from '@/services/decks/questions/useDeckQuestionsSWR'
import { useRouter } from 'next/router'

const { Title } = Typography,
    { Item } = Breadcrumb

const deckWithQuestions = Prisma.validator<Prisma.DeckDefaultArgs>()({
    include: {
        questions: {
            include: {
                options: true,
            },
        },
    },
})

export type DeckWithQuestions = Prisma.DeckGetPayload<typeof deckWithQuestions>

const questionWithOptions = Prisma.validator<Prisma.QuestionDefaultArgs>()({
    include: {
        options: true,
    },
})

export type QuestionWithOptions = Prisma.QuestionGetPayload<
    typeof questionWithOptions
>

interface IDeck {
    deck: SuperJSONResult
}

const Deck: React.FC<IDeck> = ({ deck }) => {
    const thisDeck = deserialize<DeckWithQuestions>(deck)
    const {
        push,
        query: { id },
    } = useRouter()
    const deckQuestions = useDeckQuestionsSWR(id as string, thisDeck)
    const breakpoint = Grid.useBreakpoint()
    return (
        <>
            <HeadLayout title={`Deck : ${deckQuestions.title}`} />

            <AppLayout adminOnly={true}>
                <PageHeader
                    breadcrumb={
                        <DeckBreadcrumb>
                            <Item>{deckQuestions.title}</Item>
                        </DeckBreadcrumb>
                    }
                    onBack={async () => await push('/decks')}
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
                                Deck
                            </Title>
                            {!breakpoint.md && (
                                <>
                                    <Title level={5} type={'secondary'}>
                                        {deckQuestions.title}
                                    </Title>
                                    <DeckTags data={deckQuestions.tags} />
                                </>
                            )}
                        </Space>
                    }
                    {...(breakpoint.md && {
                        subTitle: deckQuestions.title,
                        tags: <DeckTags data={deckQuestions.tags} />,
                    })}
                    footer={<QuestionTabs />}
                />
            </AppLayout>
        </>
    )
}

// noinspection JSUnusedGlobalSymbols
export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const { id } = context.query
    let deck = null
    const session = await getSession(context)
    try {
        //fetch our decks with questions
        deck = await getDeckQuestions(id as string)
        console.log('deck...', deck?.questions)
    } catch (err) {
        console.log('Error fetching Decks. ', err)
    }

    return {
        props: {
            deck: serialize(deck),
            session,
        },
    }
}

export default Deck
