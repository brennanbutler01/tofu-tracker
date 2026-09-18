import { ActivityWithQuestion } from '@/pages/api/activities'
import useSWR from 'swr'

interface IUseActivitySWR {
    fallbackData?: Array<ActivityWithQuestion>
}

export const useActivitySWR = ({ fallbackData }: IUseActivitySWR) => {
    const { data } = useSWR(`/api/activities`, { fallbackData })
    return data as Array<ActivityWithQuestion>
}
