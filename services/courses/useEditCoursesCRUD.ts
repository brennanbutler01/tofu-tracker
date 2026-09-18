import { message } from 'antd'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import type { ICourseForm } from '@/components/courses/CourseForm'
import { courseService, courseFormInput } from './courseService'
import { COURSES_API } from './useCoursesCRUD'
export const EDIT_COURSES_API = (id: string) => `/api/courses/${id}`
const useEditCoursesCRUD = () => {
    const { query } = useRouter()
    const { mutate } = useSWRConfig()
    const updateCourse = async (values: ICourseForm) => {
        if (typeof query.id !== 'string') return false
        try {
            const result = await courseService.updateCourse(
                query.id,
                courseFormInput(values)
            )
            await mutate(EDIT_COURSES_API(query.id), result.data, false)
            await mutate(COURSES_API)
            return true
        } catch {
            message.error(
                'Could not save this course. Your entries are still here. Check its prerequisites and try again.'
            )
            return false
        }
    }
    return { updateCourse }
}
export default useEditCoursesCRUD
