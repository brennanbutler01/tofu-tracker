import styled, { useTheme } from 'styled-components'

import { QuestionType } from '@prisma/client'
import React from 'react'
import { Select } from 'antd'
import { renderTag } from '@/questions/Table/QuestionTag'

interface ITypeSelect {
    value: QuestionType
    onChange: (type: QuestionType) => void
}

const StyledDiv = styled.div`
    .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
        background-color: ${props => props.theme['tofu-brand-2']};
    }
    .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
        background-color: ${props => props.theme['tofu-brand-3']};
    }
`

const TypeSelect: React.FC<ITypeSelect> = ({ value, onChange }) => {
    const theme = useTheme()
    const TYPE_SELECT_CONTAINER = 'type-select-container'
    return (
        <StyledDiv id={TYPE_SELECT_CONTAINER}>
            <Select
                bordered={false}
                getPopupContainer={el => el.parentNode}
                value={value}
                onChange={onChange}
                options={[
                    {
                        value: QuestionType.TRUE_FALSE,
                        label: renderTag({
                            type: QuestionType.TRUE_FALSE,
                            tooltip: false,
                        }),
                    },
                    {
                        value: QuestionType.MULTIPLE_CHOICE,
                        label: renderTag({
                            type: QuestionType.MULTIPLE_CHOICE,
                            tooltip: false,
                        }),
                    },
                ]}
            />
        </StyledDiv>
    )
}

export default TypeSelect
