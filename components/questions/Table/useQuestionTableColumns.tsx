import { ColumnsType, ColumnType } from 'antd/es/table'
import { renderTag } from '@/questions/Table/QuestionTag'
import { Button, Space } from 'antd'
import React, { useState } from 'react'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import { QuestionType } from '@prisma/client'
import Actions from '@/questions/Table/Actions'

export interface IQuestionTableColumns {
    isEditing: (record: QuestionWithOptions) => boolean
    edit: (record: QuestionWithOptions) => void
    saveEdit: (record: QuestionWithOptions) => Promise<void>
}

export const useQuestionTableColumns = ({
    edit,
    isEditing,
    saveEdit,
}: IQuestionTableColumns) => {
    const [expandedRowKeys, setExpandedRowKeys] = useState<Array<React.Key>>([])

    const columns: Array<ColumnType<QuestionWithOptions> & { editable?: boolean }> = [
        {
            title: 'Question',
            key: 'question',
            dataIndex: 'question',
            editable: true,
            width: '30%',
        },
        {
            title: 'Type',
            key: 'type',
            dataIndex: 'type',
            align: 'center',
            render: (_, { type }) => renderTag({ type }),
            editable: true,
        },
        {
            title: 'Answer Options',
            key: 'answerOptions',
            align: 'center',
            render: (_, record) => (
                <Space direction={'vertical'}>
                    {record.type === QuestionType.FREE_RESPONSE
                        ? 1
                        : record?.options?.length}
                    <Button
                        size={'small'}
                        type={'dashed'}
                        onClick={() =>
                            setExpandedRowKeys(
                                expandedRowKeys.includes(record?.id)
                                    ? []
                                    : [record.id]
                            )
                        }
                    >
                        View
                    </Button>
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '15%',
            render: (_, record) => (
                <Actions
                    record={record}
                    isEditing={isEditing}
                    saveEdit={saveEdit}
                    edit={edit}
                />
            ),
        },
    ]

    const mergedColumns = columns.map(col => {
        if (!col.editable) {
            return col
        }

        // noinspection JSUnusedGlobalSymbols
        return {
            ...col,
            onCell: (record: QuestionWithOptions) => ({
                record,
                inputType: col.dataIndex === 'type' ? 'select' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        }
    })

    return { mergedColumns, expandedRowKeys }
}
