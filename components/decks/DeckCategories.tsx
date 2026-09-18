import { Empty, Select, SelectProps } from 'antd'

import React from 'react'
import { deckTags } from './deckTagOptions'
import styled from 'styled-components'

const options = deckTags

interface IDeck {
    value: Array<string>
    onChange: (newValue: string[]) => void
    fullWidth?: boolean
}

export const SelectContainer = styled.div`
    &&& {
        //tags in the select - change the background + border color
        .ant-select-multiple .ant-select-selection-item {
            background-color: ${props => props.theme['tofu-brand-0']};
            border-color: ${props => props.theme['tofu-brand-5']};
        }

        //change the color of the X button on the tags
        .ant-select-multiple .ant-select-selection-item-remove:hover {
            color: ${props => props.theme['tofu-button-green-hover']};
        }

        /*select options - background of items we have selected */
        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
            background-color: var(--tofu-green-background);
        }
        /*select options - background of items we are hovering*/
        .ant-select-item-option-active:not(.ant-select-item-option-disabled):hover {
            background-color: ${props => props.theme['tofu-brand-5']};
        }
        /*select options - background of items that we lost focus on*/
        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
            background-color: ${props => props.theme['tofu-brand-3']};
        }
    }
`

const DeckCategories: React.FC<IDeck> = ({
    value,
    onChange,
    fullWidth = false,
}) => {
    const CONTAINER_ID = 'desk-category-container'
    const selectProps = {
        mode: 'multiple' as const,
        style: { width: '100%', maxWidth: '480px' },
        value,
        options,
        onChange,
        placeholder: 'Deck Categories...',
        maxTagCount: 'responsive' as const,
        dropdownStyle: {
            backgroundColor: 'var(--tofu-brand-3)',
        },
        getPopupContainer: () => document.getElementById(CONTAINER_ID),
    } as SelectProps

    return (
        <SelectContainer id={CONTAINER_ID} style={{ width: '100%' }}>
            <Select
                {...selectProps}
                filterOption={(input, option) =>
                    option?.label
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase()) || false
                }
                notFoundContent={
                    <Empty description="Search doesn't match any deck categories. Please try again" />
                }
                optionFilterProp='label'
                {...(fullWidth && { style: { width: '100%' } })}
            />
        </SelectContainer>
    )
}
export default DeckCategories
