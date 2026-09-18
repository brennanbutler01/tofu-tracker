import dayjs, { ConfigType } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export default dayjs

export const formatDate = (date: ConfigType) => dayjs(date).format('MM/DD/YYYY')
