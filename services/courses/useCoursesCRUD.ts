import { message } from 'antd'
import { useSWRConfig } from 'swr'
import type { ICourseForm } from '@/components/courses/CourseForm'
import type { CourseInput } from '@/server/contentAuthoring'
import { courseFormInput, courseService } from './courseService'
import { useCoursesSWR } from './useCoursesSWR'

export const COURSES_API = '/api/courses'
export const useCoursesCRUD = () => {
    const { mutate } = useSWRConfig()
    const courses = useCoursesSWR({})
    const refresh = async (id?: string) => {
        await mutate(COURSES_API)
        await mutate('/api/learningTracks')
        if (id) await mutate(`${COURSES_API}/${id}`)
    }
    const createCourse = async (values: ICourseForm) => {
        try {
            await courseService.createCourse(courseFormInput(values))
            await refresh()
            return true
        } catch {
            message.error(
                'Could not create this course. Your entries are still here.'
            )
            return false
        }
    }
    const deleteCourse = async (id: string) => {
        try {
            await courseService.deleteCourse(id)
            await refresh(id)
            message.success('Course archived. Existing results are preserved.')
            return true
        } catch {
            message.error(
                'Could not archive this course. Remove it from other courses’ prerequisites first, then retry.'
            )
            return false
        }
    }
    const update = async (id: string, data: Partial<CourseInput>) => {
        try {
            await courseService.updateCourse(id, data)
            await refresh(id)
            message.success('Course saved.')
            return true
        } catch {
            message.error(
                'Could not update this course. Check that its selections are available and prerequisites do not form a cycle.'
            )
            return false
        }
    }
    const missingCourse = () => {
        message.error('Course is unavailable. Refresh and try again.')
        return Promise.resolve(false)
    }
    return {
        createCourse,
        deleteCourse,
        deletePreReq: ({
            courseId,
            preReqId,
        }: {
            courseId: string
            preReqId: string
        }) => {
            const course = courses.find(item => item.id === courseId)
            return course
                ? update(courseId, {
                      preReqs: course.preReqs.filter(id => id !== preReqId),
                  })
                : missingCourse()
        },
        addPreReq: ({
            courseId,
            preReqIds,
        }: {
            courseId: string
            preReqIds: string[]
        }) => {
            const course = courses.find(item => item.id === courseId)
            return course
                ? update(courseId, {
                      preReqs: [...new Set([...course.preReqs, ...preReqIds])],
                  })
                : missingCourse()
        },
        removeCourseDeck: ({
            courseId,
            deckId,
        }: {
            courseId: string
            deckId: string
        }) => {
            const course = courses.find(item => item.id === courseId)
            return course
                ? update(courseId, {
                      deckIds: course.decks
                          .filter(deck => deck.id !== deckId)
                          .map(deck => deck.id),
                  })
                : missingCourse()
        },
        addCourseDeck: ({
            courseId,
            deckIdsToAdd,
        }: {
            courseId: string
            deckIdsToAdd: string[]
        }) => {
            const course = courses.find(item => item.id === courseId)
            return course
                ? update(courseId, {
                      deckIds: [
                          ...new Set([
                              ...course.decks.map(deck => deck.id),
                              ...deckIdsToAdd,
                          ]),
                      ],
                  })
                : missingCourse()
        },
    }
}
