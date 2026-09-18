import { Button, Space, Tooltip } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import DeleteItem from '@/components/DeleteItem'
import { Models } from '@/utils/message.utils'
import React, { useState } from 'react'
import { useDeckQuestionCRUD } from '@/services/decks/questions/useDeckQuestionCRUD'
import { useTheme } from 'styled-components'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import { IQuestionTableColumns } from '@/questions/Table/useQuestionTableColumns'

interface IActions extends IQuestionTableColumns {
    record: QuestionWithOptions
}

const Actions = ({ isEditing, edit, saveEdit, record }: IActions) => {
    const { deleteDeckQuestion } = useDeckQuestionCRUD()
    const theme = useTheme()
    return (
        <>
            {isEditing(record) ? (
                <Space>
                    <Button
                        size={'small'}
                        onClick={() => edit(record)}
                        htmlType={'reset'}
                        danger
                        type={'text'}
                    >
                        Cancel
                    </Button>
                    <Button
                        type={'text'}
                        size={'small'}
                        htmlType={'submit'}
                        onClick={() => edit(record)}
                    >
                        Confirm
                    </Button>
                </Space>
            ) : (
                <Tooltip title={'Edit'}>
                    <Button
                        onClick={() => edit(record)}
                        style={{ color: theme['tofu-cyan'], cursor: 'pointer' }}
                        type={'link'}
                    >
                        Edit
                    </Button>
                </Tooltip>
            )}
            {!isEditing(record) && (
                <DeleteItem
                    onDelete={async () => await deleteDeckQuestion(record)}
                    model={Models.QUESTION}
                    button
                    textButton
                />
            )}
        </>
    )
}

export default Actions
