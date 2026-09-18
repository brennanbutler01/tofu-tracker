import { Empty, Select } from 'antd'

import React from 'react'
import { SelectContainer } from '@/decks/DeckCategories'

interface ITimeSelect {
    value: number
    onChange: React.Dispatch<React.SetStateAction<number>>
}

const TimeSelect = ({ value, onChange }: ITimeSelect) => {
    //make minutes select
    const minutesOptions = () => {
        let optionsArray = []
        for (let i = 1; i < 60; i++) {
            optionsArray.push({
                value: i,
                label: `${i} minute${i === 1 ? `` : `s`}`,
            })
        }
        return optionsArray
    }

    return (
        <SelectContainer>
            <Select
                value={value}
                options={minutesOptions()}
                placeholder={'Select duration'}
                onChange={onChange}
                getPopupContainer={el => el.parentNode}
                showSearch
                filterOption={(input, option) =>
                    option?.label.toLowerCase().includes(input.toLowerCase()) ||
                    false
                }
                notFoundContent={
                    <Empty description="Search input doesn't match any duration values. Please try again" />
                }
            />
        </SelectContainer>
    )
}

export default TimeSelect
