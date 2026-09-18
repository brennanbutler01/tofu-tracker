import React, { useState } from 'react'
import TypeSelect from '@/questions/Table/TypeSelect'
import { Form, Input } from 'antd'
import { QuestionType } from '@prisma/client'
import { QuestionWithOptions } from '@/pages/decks/[id]'

const { Item } = Form

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean
    dataIndex: string
    title: any
    inputType: 'select' | 'text'
    record: QuestionWithOptions
    index: number
    children: React.ReactNode
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const [value, setValue] = useState<QuestionType>(record?.type)
    const inputNode =
        inputType === 'select' ? (
            <TypeSelect value={value} onChange={setValue} />
        ) : (
            <Input />
        )

    return (
        <td {...restProps}>
            {editing ? (
                <Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                    initialValue={record['dataIndex' as keyof typeof record]}
                >
                    {inputNode}
                </Item>
            ) : (
                children
            )}
        </td>
    )
}

export default EditableCell
