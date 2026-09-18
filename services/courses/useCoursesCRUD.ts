import {
    CRUDOperation,
    MessageStatus,
    Models,
    messageConfig,
} from '@/utils/message.utils'

import { ICourseForm } from '@/components/courses/CourseForm'
import { Prisma } from '@prisma/client'
import { courseService } from '@/services/courses/courseService'
import cuid from 'cuid'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'
import { useDecksSWR } from '@/services/decks/useDecksSWR'
import { useSWRConfig } from 'swr'

interface IRemoveCourseDeck {
    courseId: string
    deckId: string
}

interface IDeletePreReq {
    courseId: string
    preReqId: string
}

interface IAddPreReqs {
    courseId: string
    preReqIds: Array<string>
}

interface IAddCourseDeck {
    courseId: string
    deckIdsToAdd: Array<string>
}

export const COURSES_API = '/api/courses'

export const useCoursesCRUD = () => {
    const { mutate } = useSWRConfig()
    const courses = useCoursesSWR({})
    const decks = useDecksSWR()

    const createCourse = async (val: ICourseForm) => {
        const hasDecks = val.decks.length > 0
        const newCourse: Prisma.CourseUncheckedCreateInput = {
            id: cuid(),
            created: new Date(),
            updatedAt: new Date(),
            level: val.level,
            percentToPass: val.passingPercentage,
            title: val.title,
            preReqs: val.preReqs,
            description: val.description,
            ...(hasDecks && {
                decks: {
                    connect: val.decks.map(deck => ({ id: deck })),
                },
            }),
        }
        try {
            await mutate(
                COURSES_API,
                courseService.createCourse(newCourse).then(res => {
                    messageConfig({
                        operation: CRUDOperation.CREATE,
                        status: MessageStatus.SUCCESS,
                        model: Models.COURSES,
                    })

                    return [...courses, res.data]
                }),
                {
                    rollbackOnError: true,
                    optimisticData: [...courses, newCourse],
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.COURSES,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.CREATE,
            })
            console.log('Error creating new course', err)
        }
    }

    const deleteCourse = async (id: string) => {
        try {
            await mutate(
                COURSES_API,
                courseService.deleteCourse({ id }).then(() => {
                    messageConfig({
                        operation: CRUDOperation.DELETE,
                        status: MessageStatus.SUCCESS,
                        model: Models.COURSES,
                    })
                    return courses.filter(course => course.id !== id)
                }),
                {
                    rollbackOnError: true,
                    optimisticData: courses.filter(course => course.id !== id),
                }
            )
        } catch (err) {
            console.log('error deleting course', err)
            messageConfig({
                model: Models.COURSES,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.DELETE,
            })
        }
    }

    const deletePreReq = async ({ courseId, preReqId }: IDeletePreReq) => {
        const course = courses.find(course => course.id === courseId)
        const filteredPreReqs = course?.preReqs?.filter(id => id !== preReqId)
        try {
            await mutate(
                COURSES_API,
                courseService
                    .updateCourse({
                        id: courseId,
                        preReqs: {
                            set: filteredPreReqs,
                        },
                    })
                    .then(() => {
                        messageConfig({
                            model: Models.PRE_REQ,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.DELETE,
                        })
                        return courses.map(c =>
                            c.id === courseId
                                ? { ...c, preReqs: filteredPreReqs }
                                : c
                        )
                    }),
                {
                    rollbackOnError: false,
                    optimisticData: courses.map(c =>
                        c.id === courseId
                            ? { ...c, preReqs: filteredPreReqs }
                            : c
                    ),
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.PRE_REQ,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.DELETE,
            })
        }
    }

    const addPreReq = async ({ courseId, preReqIds }: IAddPreReqs) => {
        const course = courses.find(c => c.id === courseId)
        const preReqs = [...(course?.preReqs || []), ...preReqIds]
        try {
            await mutate(
                COURSES_API,
                courseService
                    .updateCourse({
                        id: courseId,
                        preReqs: {
                            set: preReqs,
                        },
                    })
                    .then(() => {
                        messageConfig({
                            model: Models.PRE_REQ,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.CREATE,
                        })
                        return courses.map(c =>
                            c.id === courseId ? { ...c, preReqs } : c
                        )
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: courses.map(c =>
                        c.id === courseId ? { ...c, preReqs } : c
                    ),
                }
            )
        } catch (e) {
            console.log('Error trying to create pre-reqs', e)
            messageConfig({
                model: Models.PRE_REQ,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.CREATE,
            })
        }
    }

    const removeCourseDeck = async ({
        courseId,
        deckId,
    }: IRemoveCourseDeck) => {
        const updatedCourses = courses.map(course =>
            course.id === courseId
                ? {
                      ...course,
                      decks: course.decks.filter(deck => deck.id !== deckId),
                  }
                : course
        )

        try {
            await mutate(
                COURSES_API,
                courseService
                    .updateCourse({
                        id: courseId,
                        decks: {
                            disconnect: {
                                id: deckId,
                            },
                        },
                    })
                    .then(() => {
                        messageConfig({
                            model: Models.DECK,
                            operation: CRUDOperation.DELETE,
                            status: MessageStatus.SUCCESS,
                        })
                        return updatedCourses
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: updatedCourses,
                }
            )
        } catch (err) {
            console.log(
                `There was an error trying to delete the deck ${deckId} .... ${err}`
            )
            messageConfig({
                model: Models.DECK,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.DELETE,
            })
        }
    }

    const addCourseDeck = async ({
        courseId,
        deckIdsToAdd,
    }: IAddCourseDeck) => {
        const newDecks = decks.filter(deck => deckIdsToAdd.includes(deck.id))
        const updatedCourses = courses.map(course =>
            course.id === courseId
                ? { ...course, decks: [...course.decks, ...newDecks] }
                : course
        )
        try {
            await mutate(
                COURSES_API,
                courseService
                    .updateCourse({
                        id: courseId,
                        decks: {
                            connect: deckIdsToAdd.map(id => ({ id })),
                        },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.DECK,
                            operation: CRUDOperation.CREATE,
                            status: MessageStatus.SUCCESS,
                        })
                        return updatedCourses
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: updatedCourses,
                }
            )
        } catch (err) {
            console.log('Error trying to add course deck', err)
            messageConfig({
                status: MessageStatus.ERROR,
                model: Models.DECK,
                operation: CRUDOperation.CREATE,
            })
        }
    }

    return {
        createCourse,
        deleteCourse,
        deletePreReq,
        addPreReq,
        removeCourseDeck,
        addCourseDeck,
    }
}
