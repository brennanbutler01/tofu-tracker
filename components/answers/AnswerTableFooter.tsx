import { Button, Grid, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import CorrectAnswerModal from '@/components/answers/CorrectAnswerModal'
import React, { useState } from 'react'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import OptionModal from '@/components/answers/OptionModal'
import DeleteItem from '@/components/DeleteItem'
import { Models } from '@/utils/message.utils'
import { useDeckQuestionCRUD } from '@/services/decks/questions/useDeckQuestionCRUD'

interface IAnswerTableFooter {
    question: QuestionWithOptions
    selectedRowKeys: Array<React.Key>
}

const AnswerTableFooter: React.FC<IAnswerTableFooter> = ({
    selectedRowKeys,
    question,
}) => {
    const [correctAnswerModalVisible, setCorrectAnswerModalVisible] =
        useState(false)
    const toggleCorrectAnswerModalVisibility = () =>
        setCorrectAnswerModalVisible(!correctAnswerModalVisible)
    const [optionModalVisibility, setOptionModalVisibility] = useState(false)
    const toggleOptionModalVisibility = () =>
        setOptionModalVisibility(!optionModalVisibility)
    const { deleteDeckQuestionOptions } = useDeckQuestionCRUD()
    const breakpoint = Grid.useBreakpoint()

    return (
        <Space
            direction={breakpoint.xs ? 'vertical' : 'horizontal'}
            {...(breakpoint.xs && { style: { width: '100%' } })}
            size={breakpoint.xs ? 'large' : 'middle'}
        >
            <Button
                type={breakpoint.xs ? 'dashed' : 'ghost'}
                onClick={toggleCorrectAnswerModalVisibility}
                size={'small'}
            >
                Change Correct
            </Button>
            <Button
                type='primary'
                icon={<PlusOutlined />}
                size={'small'}
                onClick={toggleOptionModalVisibility}
            >
                Create Option
            </Button>
            <DeleteItem
                model={Models.OPTIONS}
                button
                onDelete={async () =>
                    await deleteDeckQuestionOptions({
                        questionId: question.id,
                        keysToDelete: selectedRowKeys,
                    })
                }
            />
            <CorrectAnswerModal
                editing={question.id}
                onClose={toggleCorrectAnswerModalVisibility}
                val={{
                    ...question,
                    options: question.options.map(opt => ({
                        text: opt.answer,
                    })),
                    explanation: question?.explanation || '',
                }}
                visible={correctAnswerModalVisible}
            />
            <OptionModal
                visible={optionModalVisibility}
                onClose={toggleOptionModalVisibility}
                question={question}
            />
        </Space>
    )
}
export default AnswerTableFooter
