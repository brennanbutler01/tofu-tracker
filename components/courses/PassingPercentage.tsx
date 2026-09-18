import { InputNumber, Slider } from 'antd'
import React from 'react'
import styled from 'styled-components'

interface IPassing {
    value: number
    onChange: React.Dispatch<React.SetStateAction<number>>
}

const PercentageWrapper = styled.div`
    display: flex;
`

const PassingPercentage = ({ value, onChange }: IPassing) => {
    return (
        <PercentageWrapper>
            <Slider
                min={1}
                max={100}
                value={value}
                onChange={val => { if (val !== null) onChange(val) }}
                style={{ flex: 'auto' }}
            />
            <InputNumber
                min={1}
                max={100}
                value={value}
                onChange={val => { if (val !== null) onChange(val) }}
                placeholder={'Passing %'}
            />
        </PercentageWrapper>
    )
}

export default PassingPercentage
