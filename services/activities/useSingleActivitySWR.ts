import { ActivityWithQuestion } from '@/pages/api/activities'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { ACTIVITY_URL } from './useActivityCRUD'

interface IUseSingleActivitySWR {
    fallbackData?: ActivityWithQuestion
}

const useSingleActivitySWR = ({ fallbackData }: IUseSingleActivitySWR) => {
    const { query } = useRouter()
    const data = useSWR(`${ACTIVITY_URL}/${query.id}`, { fallbackData })
    return data.data as ActivityWithQuestion
}

export default useSingleActivitySWR
