import { Grid, Input, Space, Tooltip } from 'antd'
import FormLabel from '@/components/FormLabel'
import React from 'react'
const { Search } = Input

interface IDeckSearch {
    search: string
    setSearch: React.Dispatch<React.SetStateAction<string>>
}

const DeckSearch = ({ search, setSearch }: IDeckSearch) => {
    const breakpoint = Grid.useBreakpoint()

    return (
        <Space
            direction={breakpoint.xs ? 'vertical' : 'horizontal'}
            style={{ width: '100%' }}
        >
            <FormLabel label={'Search Decks'} />
            <Tooltip
                title={'Press enter or click the Search icon to filter decks'}
            >
                <Search
                    placeholder={'Search decks'}
                    onSearch={setSearch}
                    allowClear
                />
            </Tooltip>
        </Space>
    )
}

export default DeckSearch
