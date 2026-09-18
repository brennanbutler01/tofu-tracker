// noinspection JSUnusedGlobalSymbols

import { DeckWithQuestionCount, getDeckQuestionCount } from '@/pages/api/decks'
import { PageHeader, Typography } from 'antd'
import { deserialize, serialize } from '@/utils/serialize.utils'

import AppLayout from '@/components/AppLayout'
import { DeckBreadcrumb } from '@/decks/DeckBreadcrumb'
import DeckTabs from '@/decks/DeckTabs'
import { GetServerSidePropsContext } from 'next'
import HeadLayout from '@/components/HeadLayout'
import { SuperJSONResult } from 'superjson/dist/types'
import { getSession } from 'next-auth/react'
import { useDecksSWR } from '@/services/decks/useDecksSWR'
import { useRouter } from 'next/router'

const { Title, Text } = Typography

interface IDecks {
    decks: SuperJSONResult
}

const Decks = ({ decks }: IDecks) => {
    const deserializedDecks = deserialize<Array<DeckWithQuestionCount>>(decks)
    console.log(deserializedDecks)

    //pass our initial data to the decks hook
    const data = useDecksSWR(deserializedDecks)

    const { push } = useRouter()
    return (
        <>
            <HeadLayout title={'Decks'} />
            <AppLayout adminOnly={true}>
                <PageHeader
                    breadcrumb={<DeckBreadcrumb />}
                    title={
                        <Title
                            level={1}
                            style={{
                                marginBottom: 0,
                                whiteSpace: 'normal',
                                wordWrap: 'normal',
                            }}
                        >
                            Decks
                        </Title>
                    }
                    extra={
                        <Text type={'secondary'}>
                            {data?.length} deck{data?.length === 1 ? '' : 's'}{' '}
                            created
                        </Text>
                    }
                    onBack={async () => await push('/')}
                    footer={<DeckTabs />}
                />
            </AppLayout>
        </>
    )
}

export default Decks

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    let decks: Array<DeckWithQuestionCount> = []
    const session = await getSession(context)
    try {
        decks = await getDeckQuestionCount()
    } catch (err) {
        console.log('error getting decks', err)
    }

    console.log('decks', decks)
    return {
        props: { decks: serialize(decks), session },
    }
}
