import { Col, Row } from 'antd'
import DeckFilterTags from '@/decks/DeckFilterTags'
import DeckSearch from '@/decks/DeckSearch'
import React, { useEffect, useState } from 'react'
import { DeckWithQuestionCount } from '@/pages/api/decks'
import { useDecksSWR } from '@/services/decks/useDecksSWR'

interface IDeckFilters {
    filteredDecks: Array<DeckWithQuestionCount>
    setFilteredDecks: React.Dispatch<
        React.SetStateAction<Array<DeckWithQuestionCount>>
    >
    checkedTags: Array<string>
    setCheckedTags: React.Dispatch<React.SetStateAction<Array<string>>>
}

const DeckFilters = ({
    filteredDecks,
    setFilteredDecks,
    checkedTags,
    setCheckedTags,
}: IDeckFilters) => {
    const [search, setSearch] = useState('')
    const decks = useDecksSWR()

    //filter our decks based on search input
    const searchForDecks = (
        decks: Array<DeckWithQuestionCount>,
        search: string
    ) => {
        return decks.filter(
            deck =>
                deck.title.toLowerCase().includes(search.toLowerCase()) ||
                deck.tags.some(tag =>
                    tag.toLowerCase().includes(search.toLowerCase())
                )
        )
    }

    useEffect(() => {
        //if we don't have a search filter, we are going to use all decks
        if (search === '') {
            setFilteredDecks(decks)
        } else {
            // else we will filter the decks
            setFilteredDecks(searchForDecks(decks, search))
        }
    }, [setFilteredDecks, filteredDecks, search, decks])

    return (
        <Row gutter={[0, 16]}>
            <Col span={24}>
                <Row>
                    <Col span={24} md={16}>
                        <DeckSearch search={search} setSearch={setSearch} />
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <DeckFilterTags
                    filteredDecks={filteredDecks}
                    setFilteredDecks={setFilteredDecks}
                    checkedTags={checkedTags}
                    setCheckedTags={setCheckedTags}
                />
            </Col>
        </Row>
    )
}

export default DeckFilters
