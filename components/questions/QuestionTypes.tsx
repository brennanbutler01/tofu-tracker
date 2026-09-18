import { QuestionType } from '@prisma/client'
import { Radio, RadioChangeEvent } from 'antd'
import React from 'react'
import styled from 'styled-components'
const { Group } = Radio

interface IQuestionTypes {
    value: QuestionType
    onChange: (e: RadioChangeEvent) => void
}

export const GroupContainer = styled.div`
    &&& {
        .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within {
            box-shadow: 0 0 0 3px var(--tofu-green-background);
        }

        .ant-radio-group-solid
            .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
            color: ${props => props.theme['tofu-brand-0']};
        }
    }
`

const typeOptions = [
    { label: 'True or False', value: QuestionType['TRUE_FALSE'] },
    { label: 'Multiple Choice', value: QuestionType['MULTIPLE_CHOICE'] },
    { label: 'Free Response', value: QuestionType['FREE_RESPONSE'] },
    { label: 'Simple Response', value: QuestionType['SIMPLE_RESPONSE'] },
]

const QuestionTypes: React.FC<IQuestionTypes> = ({ value, onChange }) => {
    return (
        <GroupContainer>
            <Group
                value={value}
                options={typeOptions}
                onChange={onChange}
                optionType={'button'}
                buttonStyle={'outline'}
                name={'type'}
            />
        </GroupContainer>
    )
}

export default QuestionTypes
