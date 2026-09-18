import { Button, Checkbox, List, Tooltip } from 'antd'
import React from 'react'
import styled, { useTheme } from 'styled-components'
import { AnswersToGrade } from '@/pages/api/toGrade/[...cursor]'
import { useGradingSessionCRUD } from '@/services/gradingSession/useGradingSessionCRUD'
import { useRouter } from 'next/router'
import TimestampTag from '@/components/TimestampTag'
const {
    Item,
    Item: { Meta },
} = List

const StyledItem = styled(Item)`
    &&& {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-6']};
    }
`

interface IAnswerItem {
    item: AnswersToGrade
    selectedKeys: Array<React.Key>
    selectKey: (key: string) => void
    loading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const AnswerListItem = ({
    selectedKeys,
    selectKey,
    item,
    loading,
    setLoading,
}: IAnswerItem) => {
    const theme = useTheme()
    const { createGradingSession } = useGradingSessionCRUD()
    const { push } = useRouter()

    return (
        <StyledItem
            key={item?.id}
            actions={[
                <Button
                    loading={loading}
                    type={'dashed'}
                    key={'grade'}
                    onClick={async () => {
                        setLoading(true)
                        const id = await createGradingSession({
                            answersToGrade: [item.id],
                        })
                        if (id) await push(`/admin/grade/${id}`)
                        setLoading(false)
                    }}
                >
                    Grade
                </Button>,
            ]}
            extra={
                <Tooltip title={'Select Answer'}>
                    <Checkbox
                        className={'select-answer'}
                        checked={selectedKeys.includes(item.id)}
                        onChange={() => selectKey(item.id)}
                    />
                </Tooltip>
            }
        >
            <Meta
                title={item?.question?.question}
                description={item?.userAnswer?.answer}
            />

            <TimestampTag
                date={item.created}
                color={theme['tofu-green-background']}
            />
        </StyledItem>
    )
}

export default AnswerListItem
