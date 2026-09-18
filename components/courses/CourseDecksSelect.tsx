import { CourseWithDecks } from '@/pages/api/courses'
import DeckListEmpty from '../decks/DeckLlistEmpty'
import React from 'react'
import { Select } from 'antd'
import { useDecksSWR } from '@/services/decks/useDecksSWR'

interface ICourseDecks {
    value: Array<string>
    onChange: (val: Array<string>) => void
    isPopover?: boolean
    course?: CourseWithDecks
}

interface SelectOption {
    label: string
    value: string
}

const CourseDecksSelect = ({
    value,
    onChange,
    isPopover = false,
    course,
}: ICourseDecks) => {
    const decks = useDecksSWR()

    const selectOptions = decks?.reduce<Array<SelectOption>>((acc, curr) => {
        if (isPopover) {
            const hasDeckAlready = course?.decks.find(d => d.id === curr.id)
            if (!hasDeckAlready) {
                return [...acc, { label: curr.title, value: curr.id }]
            }
            return acc
        } else {
            return [...acc, { label: curr.title, value: curr.id }]
        }
    }, [])

    return (
        <Select
            mode={'multiple'}
            getPopupContainer={el => el.parentNode}
            placeholder={'Decks'}
            options={selectOptions}
            value={value}
            onChange={onChange}
            {...(isPopover && { style: { width: '300px' } })}
            notFoundContent={<DeckListEmpty />}
            filterOption={(input, option) =>
                option?.label?.toLowerCase()?.includes(input?.toLowerCase()) ||
                false
            }
        />
    )
}
export default CourseDecksSelect
