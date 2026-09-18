import { COURSES_API } from '@/services/courses/useCoursesCRUD'
import { CourseWithDecks } from '@/pages/api/courses'
import { useRouter } from 'next/router'
import useSWR from 'swr'

interface ICoursesSWR {
    fallbackData?: CourseWithDecks
}

export const useEditCourseSWR = ({ fallbackData }: ICoursesSWR) => {
    const { query } = useRouter()
    const { data } = useSWR(`${COURSES_API}/${query.id}`)
    return data as CourseWithDecks
}
