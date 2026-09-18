import styled from 'styled-components'
import { Tag } from 'antd'
import React from 'react'

export const StyledTag = styled(Tag)<{ color?: string; fontColor?: string }>`
    background-color: ${props => props.color || props.theme['tofu-brand-3']};
    border-color: ${props => props.theme['tofu-brand-7']};
    // color: ${props => props.fontColor || 'unset'};
`

interface IDeckTags {
    data: Array<string>
}

const DeckTags: React.FC<IDeckTags> = ({ data }) => {
    return (
        <>
            {data.map(item => (
                <StyledTag key={item}>{item}</StyledTag>
            ))}
        </>
    )
}

export default DeckTags
