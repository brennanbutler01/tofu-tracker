import styled from 'styled-components'
import React from 'react'

const StyledLabel = styled.label<{ small: boolean }>`
    color: ${props => props.theme['tofu-text']};
    &&& {
        font-size: ${props => (props.small ? '12px' : '16px')};
    }
`

const FormLabel: React.FC<{ label: string; small?: boolean }> = ({
    label,
    small = false,
}) => {
    return <StyledLabel small={small}>{label}</StyledLabel>
}

export default FormLabel
