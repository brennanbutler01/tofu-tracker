import { Button, Col, Empty, Row, Skeleton } from 'antd'

import React, { useState } from 'react'
import DeckCard from './DeckCard'
import { useDecksSWR } from '@/services/decks/useDecksSWR'
import DeckFilters from '@/decks/DeckFilters'
import { DeckTabKeys } from '@/decks/DeckTabs'

interface IDecks {
    setTab: React.Dispatch<React.SetStateAction<DeckTabKeys>>
}

const Decks = ({ setTab }: IDecks) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const decks = useDecksSWR()
    const [filteredDecks, setFilteredDecks] = useState(decks)
    const [checkedTags, setCheckedTags] = useState<Array<string>>([])

    return (
        <Row gutter={[24, 24]} style={{ marginTop: '15px' }}>
            <Skeleton active loading={!decks}>
                <Col span={24}>
                    <DeckFilters
                        filteredDecks={filteredDecks}
                        setFilteredDecks={setFilteredDecks}
                        checkedTags={checkedTags}
                        setCheckedTags={setCheckedTags}
                    />
                </Col>
                {filteredDecks?.length === 0 ? (
                    <Col span={24}>
                        <Empty description={'No Decks matching search'}>
                            <Button onClick={() => setTab('create')}>
                                Create new deck
                            </Button>
                        </Empty>
                    </Col>
                ) : (
                    (checkedTags?.length === 0
                        ? filteredDecks
                        : filteredDecks.filter(d =>
                              d.tags.some(t => checkedTags.includes(t))
                          )
                    )?.map(deck => (
                        <Col
                            key={deck.id}
                            md={{ span: 8 }}
                            lg={{ span: 6 }}
                            span={24}
                        >
                            <DeckCard
                                deck={deck}
                                isDeleting={isDeleting}
                                setIsDeleting={setIsDeleting}
                            />
                        </Col>
                    ))
                )}
            </Skeleton>
        </Row>
    )
}

export default Decks
