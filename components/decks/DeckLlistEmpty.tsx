import { Button, Empty } from 'antd'

import Link from 'next/link'

const DeckListEmpty = () => {
    return (
        <Empty description='No Decks. Click below to make a new one.'>
            <Button>
                <Link legacyBehavior href={{ pathname: '/decks', query: { tab: 'create' } }}>
                    Deck
                </Link>
            </Button>
        </Empty>
    )
}
export default DeckListEmpty
