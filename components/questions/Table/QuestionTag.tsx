import { QuestionType } from '@prisma/client'
import { Tooltip } from 'antd'

import { StyledTag } from '@/decks/DeckTags'

interface ITagProps {
    type: QuestionType
    tooltip?: boolean
}

const tagConfig = {
    [QuestionType.SIMPLE_RESPONSE]: {
        text: 'SIMPLE',
        color: '#004daa',
    },
    [QuestionType.TRUE_FALSE]: {
        text: 'T/F',
        color: 'rgba(0, 48, 34, 1)',
    },
    [QuestionType.FREE_RESPONSE]: {
        text: 'FREE',
        color: '#4d505f',
    },
    [QuestionType.MULTIPLE_CHOICE]: {
        text: 'CHOICE',
        color: '#320671',
    },
}

export const renderTag = ({ type, tooltip = true }: ITagProps) => {
    const { text, color } = tagConfig[type]
    const tag = <StyledTag color={color}>{text}</StyledTag>

    return tooltip ? (
        <Tooltip
            title={
                type === QuestionType.TRUE_FALSE
                    ? 'True or False'
                    : type === QuestionType.MULTIPLE_CHOICE
                    ? 'Multiple Choice'
                    : 'Free Response'
            }
        >
            {tag}
        </Tooltip>
    ) : (
        <>{tag}</>
    )
}
