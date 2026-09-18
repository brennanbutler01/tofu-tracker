import type { CourseInput } from '@/server/contentAuthoring'
import type { CourseWithDecks } from '@/pages/api/courses'
import type { ICourseForm } from '@/components/courses/CourseForm'
import { CourseLevel } from '@prisma/client'
import { http } from '../http'

export const courseFormInput = (values: ICourseForm): CourseInput => ({
    title: values.title,
    description: values.description,
    deckIds: values.decks ?? [],
    preReqs: values.preReqs ?? [],
    level: values.level ?? CourseLevel.ALL,
    percentToPass: values.passingPercentage ?? 90,
})
export const courseService = {
    createCourse: (data: CourseInput) =>
        http.request<CourseWithDecks>({
            method: 'POST',
            url: '/courses',
            data,
        }),
    updateCourse: (id: string, data: Partial<CourseInput>) =>
        http.request<CourseWithDecks>({
            method: 'PUT',
            url: `/courses/${id}`,
            data,
        }),
    deleteCourse: (id: string) => http.delete(`/courses/${id}`),
}
