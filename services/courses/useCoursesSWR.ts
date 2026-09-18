import { COURSES_API } from '@/services/courses/useCoursesCRUD'
import { Course } from '@prisma/client'
import { CourseWithDecks } from '@/pages/api/courses'
import useSWR from 'swr'

interface ICoursesSWR {
    fallbackData?: Array<CourseWithDecks>
}

export const useCoursesSWR = ({ fallbackData = [] }: ICoursesSWR) => {
    const { data } = useSWR(COURSES_API)
    return data as Array<CourseWithDecks>
}
