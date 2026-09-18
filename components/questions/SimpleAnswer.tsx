import { SimpleResponseInputTypes } from '@prisma/client'
import { Input, InputNumber } from 'antd'
import React from 'react'

interface ISimpleAnswer {
    inputType?: SimpleResponseInputTypes
    value: string | number
    onChange: React.Dispatch<React.SetStateAction<string | number>>
    disabled?: boolean
}

export const SimpleAnswer = ({
    inputType,
    value,
    onChange,
    disabled = false,
}: ISimpleAnswer) => {
    const props = {
        style: { width: '100%' },
        value,
        onChange: (next: string | number | null) => onChange(next ?? ''),
        disabled,
    }

    const renderInput = () => {
        switch (inputType) {
            case SimpleResponseInputTypes.CURRENCY:
                return (
                    <InputNumber
                        {...props}
                        formatter={value =>
                            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={value => (value ?? '').replace(/\$\s?|(,*)/g, '')}
                    />
                )

            case SimpleResponseInputTypes.NUMBER:
                return <InputNumber {...props} />

            default:
                return (
                    <Input
                        value={value}
                        onInput={e => onChange(e.currentTarget.value)}
                        placeholder={'Correct Answer'}
                    />
                )
        }
    }
    return <>{renderInput()}</>
}
