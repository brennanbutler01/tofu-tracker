import {
    CRUDOperation,
    MessageStatus,
    Models,
    messageConfig,
} from '@/utils/message.utils'

import { CourseWithDecks } from '@/pages/api/courses'
import { ICourseForm } from '@/components/courses/CourseForm'
import { Prisma } from '@prisma/client'
import { courseService } from './courseService'
import { printError } from '@/utils/printError.utils'
import { useCoursesSWR } from './useCoursesSWR'
import { useDecksSWR } from '../decks/useDecksSWR'
import { useEditCourseSWR } from './useEditCourseSWR'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'

export const EDIT_COURSES_API = (id: string) => `/api/courses/${id}`

const useEditCoursesCRUD = () => {
    const courses = useCoursesSWR({})
    const swrCourse = useEditCourseSWR({})
    const swrDecks = useDecksSWR()
    const { mutate } = useSWRConfig()
    const { query } = useRouter()

    const updateCourse = async ({
        decks,
        description,
        level,
        passingPercentage,
        preReqs,
        title,
    }: ICourseForm) => {
        const updateCourse: Prisma.CourseUpdateInput = {
            decks: {
                set: decks.map(deckId => ({ id: deckId })),
            },
            percentToPass: passingPercentage,
            updatedAt: new Date(),
            description,
            level,
            title,
            preReqs,
        }

        try {
            await mutate(
                EDIT_COURSES_API(swrCourse.id),
                courseService
                    .updateCourse({ id: swrCourse.id, ...updateCourse })
                    .then(res => {
                        messageConfig({
                            model: Models.COURSES,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...swrCourse,
                        ...updateCourse,
                        decks: decks.map(deckId =>
                            swrDecks.find(deck => deck.id === deckId)
                        ),
                    },
                }
            )
        } catch (err) {
            printError({
                err,
                model: Models.COURSES,
                operation: CRUDOperation.UPDATE,
            })
        }
    }
    return { updateCourse }
}
export default useEditCoursesCRUD
