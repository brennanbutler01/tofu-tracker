import { printError } from '@/utils/printError.utils'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { ITrackForm } from '@/components/learningTracks/TrackForm'
import { useEditLearningTrackSWR } from '@/services/learningTrack/useEditLearningTrackSWR'
import { LEARNING_TRACK_API } from '@/services/learningTrack/useLearningTrackCRUD'
import { useRouter } from 'next/router'
import { learningTrackService } from '@/services/learningTrack/learningTrackService'
import cuid from 'cuid'
import { useSWRConfig } from 'swr'
import { CourseOrder, Prisma } from '@prisma/client'
import CourseOrderCreateManyLearningTrackInput = Prisma.CourseOrderCreateManyLearningTrackInput
import CourseOrderUpdateManyWithWhereWithoutLearningTrackInput = Prisma.CourseOrderUpdateManyWithWhereWithoutLearningTrackInput
import { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'

interface IEditTrack extends ITrackForm {
    id: string
}

export const useEditLearningTrackCRUD = () => {
    const track = useEditLearningTrackSWR({})
    const { query } = useRouter()
    const { mutate } = useSWRConfig()
    const editLearningTrack = async ({
        id,
        courses,
        courseOrder,
        title,
        description,
    }: IEditTrack) => {
        try {
            //these are courses that we no longer have and need to be removed
            const coursesToDisconnect = track.courseOrder.filter(
                t => courseOrder.indexOf(t.courseId) === -1
            )
            //courseOrder ids to disconnect
            const courseOrderIdsToDisconnect = coursesToDisconnect.map(c => ({
                id: c.id,
            }))
            //these are new courses that we didn't have  before but now need to add
            const coursesToConnect = courseOrder.filter(
                courseId =>
                    track.courseOrder.findIndex(
                        c => c.courseId === courseId
                    ) === -1
            )

            //indexes to update
            const courseOrderIndexesToUpdate = courseOrder.reduce<
                CourseOrderUpdateManyWithWhereWithoutLearningTrackInput[]
            >((acc, courseId, index) => {
                if (!coursesToConnect.includes(courseId)) {
                    const courseOrder = track.courseOrder.find(
                        order => order.courseId === courseId
                    )
                    return [
                        ...acc,
                        {
                            where: {
                                id: courseOrder?.id,
                            },
                            data: {
                                updatedAt: new Date(),
                                index,
                            },
                        } as CourseOrderUpdateManyWithWhereWithoutLearningTrackInput,
                    ]
                }
                return acc
            }, [])

            const newCourseOrder =
                coursesToConnect.map<CourseOrderCreateManyLearningTrackInput>(
                    c => ({
                        id: cuid(),
                        created: new Date(),
                        courseId: c,
                        index: courseOrder.indexOf(c),
                        updatedAt: new Date(),
                    })
                )

            await mutate(
                `${LEARNING_TRACK_API}/${query.id}`,
                learningTrackService
                    .updateTrack({
                        id,
                        updatedAt: new Date(),
                        title,
                        description,
                        courseOrder: {
                            disconnect: courseOrderIdsToDisconnect,
                            createMany: {
                                data: newCourseOrder,
                            },
                            updateMany: courseOrderIndexesToUpdate,
                        },
                        courses: {
                            disconnect: coursesToDisconnect.map(c => ({
                                id: c.courseId,
                            })),
                            connect: coursesToConnect.map(courseId => ({
                                id: courseId,
                            })),
                        },
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.LEARNING_TRACK,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return { ...track, ...res.data }
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...track,
                        title,
                        description,
                        updatedAt: new Date(),
                        courseOrder: [
                            ...newCourseOrder,
                            ...track.courseOrder.reduce<Array<CourseOrder>>(
                                (acc, curr, index) => {
                                    //is this a course we need to disconnect?
                                    const disconnectIndex =
                                        courseOrderIdsToDisconnect.findIndex(
                                            id => id.id === curr.id
                                        )
                                    if (disconnectIndex > 0) {
                                        return acc
                                    } else {
                                        //is this one that we need to update?
                                        const notANewCourse =
                                            coursesToConnect.includes(curr.id)
                                        if (notANewCourse) {
                                            return [
                                                ...acc,
                                                {
                                                    ...curr,
                                                    index: courseOrder.indexOf(
                                                        curr.courseId
                                                    ),
                                                },
                                            ]
                                        }
                                        return acc
                                    }
                                    return acc
                                },
                                []
                            ),
                        ],
                    } as LearningTrackWithOrderedCourses,
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

    return { editLearningTrack }
}
