import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'

import { ITrackForm } from '@/components/learningTracks/TrackForm'
import { CourseOrder, Prisma } from '@prisma/client'
import cuid from 'cuid'
import { learningTrackService } from '@/services/learningTrack/learningTrackService'
import { printError } from '@/utils/printError.utils'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'
import { useLearningTrackSWR } from '@/services/learningTrack/useLearningTrackSWR'
import { useSWRConfig } from 'swr'

export const LEARNING_TRACK_API = '/api/learningTracks'

interface IDeleteTrack {
    trackId: string
}

interface IReOrderTrackCourses {
    trackId: string
    courseOrder: Array<string>
}

interface IDeleteCourse {
    trackId: string
    courseId: string
}

export const useLearningTrackCRUD = () => {
    const tracks = useLearningTrackSWR({})
    const swrCourses = useCoursesSWR({})
    const { mutate } = useSWRConfig()

    const createLearningTrack = async ({
        title,
        courses,
        description,
        courseOrder,
    }: ITrackForm) => {
        try {
            const coursesToConnect = courses.map(id => ({ id }))
            const orderedCourses: Prisma.Enumerable<Prisma.CourseOrderCreateManyLearningTrackInput> =
                courseOrder.map((courseId, index) => ({
                    id: cuid(),
                    created: new Date(),
                    updatedAt: new Date(),
                    courseId,
                    index,
                }))

            const newTrack: Prisma.LearningTrackCreateInput = {
                id: cuid(),
                created: new Date(),
                courses: {
                    connect: coursesToConnect,
                },
                title,
                description,
                courseOrder: {
                    createMany: {
                        data: orderedCourses,
                    },
                },
            }

            await mutate(
                LEARNING_TRACK_API,
                learningTrackService.createTrack(newTrack).then(res => {
                    messageConfig({
                        model: Models.LEARNING_TRACK,
                        status: MessageStatus.SUCCESS,
                        operation: CRUDOperation.CREATE,
                    })
                    return [...tracks, res.data]
                }),
                {
                    rollbackOnError: true,
                    optimisticData: [
                        ...tracks,
                        {
                            ...newTrack,
                            courses: coursesToConnect.map(course =>
                                swrCourses.find(c => c.id === course.id)
                            ),
                            courseOrder: orderedCourses,
                        },
                    ],
                }
            )
        } catch (err) {
            await printError({
                model: Models.LEARNING_TRACK,
                operation: CRUDOperation.CREATE,
                err,
            })
        }
    }

    const deleteLearningTrack = async ({ trackId }: IDeleteTrack) => {
        try {
            const filteredTracks = tracks.filter(t => t.id !== trackId)
            await mutate(
                LEARNING_TRACK_API,
                learningTrackService.deleteTrack({ id: trackId }).then(() => {
                    messageConfig({
                        model: Models.LEARNING_TRACK,
                        status: MessageStatus.SUCCESS,
                        operation: CRUDOperation.DELETE,
                    })
                    return filteredTracks
                }),
                {
                    optimisticData: filteredTracks,
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            await printError({
                model: Models.LEARNING_TRACK,
                operation: CRUDOperation.DELETE,
                err,
            })
        }
    }

    const reOrderLearningTrackCourses = async ({
        trackId,
        courseOrder,
    }: IReOrderTrackCourses) => {
        try {
            const fullTrack = tracks.find(track => track.id === trackId)
            const updateTrack: Prisma.LearningTrackUncheckedUpdateInput = {
                id: trackId,
                courseOrder: {
                    updateMany: courseOrder.map((courseId, index) => {
                        const courseOrder = fullTrack?.courseOrder?.find(
                            order => order.courseId === courseId
                        )
                        return {
                            where: {
                                id: courseOrder?.id,
                            },
                            data: {
                                updatedAt: new Date(),
                                index,
                            },
                        }
                    }),
                },
            }

            const updatedTracks = tracks.map(track =>
                track.id === trackId
                    ? {
                          ...track,
                          updatedAt: new Date(),
                          courseOrder: fullTrack?.courseOrder
                              .map<CourseOrder>(order => {
                                  const courseOrderIndex = courseOrder.indexOf(
                                      order.courseId
                                  )
                                  return {
                                      ...order,
                                      index: courseOrderIndex,
                                      updatedAt:
                                          courseOrderIndex === order.index
                                              ? order.updatedAt
                                              : new Date(),
                                  }
                              })
                              .sort((a, b) => (a.index > b.index ? 1 : -1)),
                      }
                    : track
            )

            console.log(
                updatedTracks.find(track => track.id === trackId)?.courseOrder,
                courseOrder
            )

            await mutate(
                LEARNING_TRACK_API,
                learningTrackService.updateTrack(updateTrack).then(() => {
                    messageConfig({
                        model: Models.LEARNING_TRACK,
                        operation: CRUDOperation.UPDATE,
                        status: MessageStatus.SUCCESS,
                    })
                    return updatedTracks
                }),
                {
                    rollbackOnError: true,
                    optimisticData: updatedTracks,
                }
            )
        } catch (err) {
            await printError({
                model: Models.LEARNING_TRACK,
                operation: CRUDOperation.UPDATE,
                err,
            })
        }
    }

    const deleteCourse = async ({ trackId, courseId }: IDeleteCourse) => {
        try {
            const courseOrder = tracks
                .find(t => t.id === trackId)
                ?.courseOrder?.find(c => c.courseId === courseId)?.id

            const updateTracks = tracks.map(track =>
                track.id === trackId
                    ? {
                          ...track,
                          courseOrder: track.courseOrder.filter(
                              order => order.id !== courseOrder
                          ),
                      }
                    : track
            )

            await mutate(
                LEARNING_TRACK_API,
                learningTrackService
                    .updateTrack({
                        id: trackId,
                        courseOrder: {
                            delete: {
                                id: courseOrder,
                            },
                        },
                        courses: {
                            disconnect: {
                                id: courseId,
                            },
                        },
                    })
                    .then(() => {
                        messageConfig({
                            model: Models.LEARNING_TRACK,
                            operation: CRUDOperation.DELETE,
                            status: MessageStatus.SUCCESS,
                        })
                        return updateTracks
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: updateTracks,
                }
            )
        } catch (err) {
            await printError({
                model: Models.LEARNING_TRACK,
                operation: CRUDOperation.DELETE,
                err,
            })
        }
    }

    return {
        createLearningTrack,
        deleteLearningTrack,
        reOrderLearningTrackCourses,
        deleteCourse,
    }
}
