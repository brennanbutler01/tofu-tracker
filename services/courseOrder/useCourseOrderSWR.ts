import useSWR from 'swr'
import { CourseOrder } from '@prisma/client'

export const useCourseOrderSWR = (learningTrackId?: string) => {
    const { data } = useSWR(`/api/courseOrder/${learningTrackId}`)
    return data as Array<CourseOrder>
}
