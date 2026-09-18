import { Tag, Tooltip, Typography } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { DeckWithQuestionCount } from '@/pages/api/decks'
import styled from 'styled-components'
const { Text } = Typography,
    { CheckableTag } = Tag

interface IDeckFilters {
    filteredDecks: Array<DeckWithQuestionCount>
    setFilteredDecks: React.Dispatch<
        React.SetStateAction<Array<DeckWithQuestionCount>>
    >
    checkedTags: Array<string>
    setCheckedTags: React.Dispatch<React.SetStateAction<Array<string>>>
}

export const TagContainer = styled.div`
    &&& {
        .ant-tag-checkable-checked {
            background-color: ${props => props.theme['tofu-button-green']};
            // color: ${props => props.theme['tofu-brand-0']};
        }

        .ant-typography {
            color: ${props => props.theme['tofu-brand-4']};
        }

        .ant-tag {
            transition: all 0.1s;
        }
    }
`

const DeckFilterTags = ({
    filteredDecks,
    setCheckedTags,
    checkedTags,
}: IDeckFilters) => {
    const [filterTags, setFilterTags] = useState<Record<string, number>>({})

    //group and count our tags
    const buildTagHashMap = useCallback(() => {
        let ourTags: Record<string, number> = {}
        filteredDecks?.forEach(deck => {
            const tags = deck.tags
            // go through each decks tags
            tags.forEach(tag => {
                //if we have the tag already, we will increment its count or else we just add it to the map
                ourTags = {
                    ...ourTags,
                    [tag]: ourTags?.[tag] ? ourTags[tag] + 1 : 1,
                }
            })
        })
        return ourTags
    }, [filteredDecks])

    useEffect(() => {
        setFilterTags(buildTagHashMap())
    }, [buildTagHashMap])

    return (
        <TagContainer>
            <Tooltip title={'See all decks'}>
                <CheckableTag
                    checked={checkedTags.length === 0}
                    key={'all'}
                    onChange={() => setCheckedTags([])}
                >
                    All
                </CheckableTag>
            </Tooltip>
            {Object.entries(filterTags).map(([k, v]) => (
                <CheckableTag
                    checked={checkedTags.indexOf(k) !== -1}
                    key={k}
                    onChange={checked =>
                        setCheckedTags(
                            checked
                                ? [...checkedTags, k]
                                : checkedTags.filter(tag => tag !== k)
                        )
                    }
                >
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Text strong style={{ fontSize: '15px' }}>
                            {v}
                        </Text>
                        <Text>{k}</Text>
                    </div>
                </CheckableTag>
            ))}
        </TagContainer>
    )
}

export default DeckFilterTags
