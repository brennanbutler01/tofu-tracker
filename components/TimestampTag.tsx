import dayjs from '@/utils/dayjs'
import { StyledTag } from '@/decks/DeckTags'
import { Tooltip } from 'antd'

interface ITimestampTag {
    color?: string
    date: Date
}

const TimestampTag = ({ color, date }: ITimestampTag) => {
    return (
        <Tooltip title={dayjs(date).format('MM/DD/YYYY')}>
            <StyledTag {...(color && { color })}>
                {dayjs(date).fromNow()}
            </StyledTag>
        </Tooltip>
    )
}
export default TimestampTag
