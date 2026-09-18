import { TableColumnsType } from 'antd'
import { StyledTag } from '@/decks/DeckTags'
import { CheckOutlined } from '@ant-design/icons'
import React from 'react'
import { AnswerOption } from '@prisma/client'

const useOptionsColumns = (correctAnswer: string) => {
    const columns: TableColumnsType<AnswerOption> = [
        { title: 'Answer', key: 'answer', dataIndex: 'answer' },
        {
            title: 'Is Correct?',
            key: 'isCorrect?',
            align: 'center',
            render: (_, record) => (
                <>
                    {record.answer === correctAnswer && (
                        <StyledTag>
                            <CheckOutlined />
                        </StyledTag>
                    )}
                </>
            ),
        },
    ]
    return columns
}

export default useOptionsColumns
