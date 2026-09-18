import { ICommentForm } from '@/components/game/ParentCommentEditor'
import { useSWRConfig } from 'swr'
import { feedbackService } from '@/services/feedback/feedbackService'
import { Prisma } from '@prisma/client'
import { useSession } from 'next-auth/react'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import {
    FullQuestionComment,
    FullQuestionFeedback,
    FullResourceComment,
    useFeedbackSWR,
} from '@/services/feedback/useFeedbackSWR'
import cuid from 'cuid'
import { IResourceForm } from '@/components/game/resources/FeedbackResourceForm'
import { LikeType } from '@/utils/useLikes'
import { addLikeOrDislike } from '@/utils/addLikeDislike'
import { ResourceWithComments } from '@/components/game/resources/ResourceList'

export const FEEDBACK_URL = (questionId: string) =>
    `/api/questions/feedback/${questionId}`

export enum LikeActions {
    LIKE,
    DISLIKE,
}

interface ICreateChildComment extends ICommentForm {
    parentId: string
}

export const useFeedbackCRUD = (questionId: string) => {
    const { mutate } = useSWRConfig()
    const { data: session } = useSession()
    const feedback = useFeedbackSWR(questionId)

    const createQuestionChildComment = async ({
        comment,
        parentId,
    }: ICreateChildComment) => {
        console.log('create a new child element...', comment, feedback)
        const newComment: Prisma.QuestionCommentsCreateWithoutQuestionFeedbackInput =
            {
                id: cuid(),
                created: new Date(),
                comment,
                user: {
                    connect: {
                        id: session?.user?.userId,
                    },
                },
                parentComment: parentId,
            }

        if (feedback) {
            const parentChildren = feedback?.comments?.find(
                com => com.id === parentId
            )?.childrenComments

            const updateFeedback: Prisma.QuestionFeedbackUpdateInput = {
                id: questionId,
                comments: {
                    create: newComment,
                    update: {
                        where: {
                            id: parentId,
                        },
                        data: {
                            childrenComments: [
                                ...(parentChildren || []),
                                newComment.id as string,
                            ],
                        },
                    },
                },
            }
            console.log('update feedback...', updateFeedback)
            try {
                await mutate(
                    FEEDBACK_URL(questionId),
                    feedbackService
                        .modifyFeedback(questionId, updateFeedback)
                        .then(res => {
                            messageConfig({
                                model: Models.COMMENT,
                                status: MessageStatus.SUCCESS,
                                operation: CRUDOperation.CREATE,
                            })
                            return res.data
                        }),
                    {
                        rollbackOnError: true,
                        optimisticData: {
                            ...feedback,
                            comments: [
                                ...feedback.comments.map(c =>
                                    c.id === parentId
                                        ? {
                                              ...c,
                                              childrenComments: [
                                                  ...c.childrenComments,
                                                  newComment.id,
                                              ],
                                          }
                                        : c
                                ),
                                { ...newComment, user: session?.user },
                            ],
                        },
                    }
                )
            } catch (err) {
                console.log(`Error trying to create child comment: ${err}`)
                messageConfig({
                    model: Models.COMMENT,
                    status: MessageStatus.ERROR,
                    operation: CRUDOperation.CREATE,
                })
            }
        }
    }

    const createResourceChildComment = async ({
        comment,
        parentId,
        resourceId,
    }: ICreateChildComment & { resourceId: string }) => {
        const newComment: Prisma.ResourceCommentsCreateWithoutResourceInput = {
            id: cuid(),
            created: new Date(),
            comment,
            user: {
                connect: {
                    id: session?.user?.userId,
                },
            },
            parentComment: parentId,
        }

        if (feedback?.resources) {
            const parentChildren = feedback?.resources
                ?.find(r => r.id === resourceId)
                ?.comments?.find(com => com.id === parentId)?.childrenComments

            const updateFeedback: Prisma.QuestionFeedbackUpdateInput = {
                id: questionId,
                resources: {
                    update: {
                        where: {
                            id: resourceId,
                        },
                        data: {
                            comments: {
                                create: newComment,
                                update: {
                                    where: {
                                        id: parentId,
                                    },
                                    data: {
                                        childrenComments: [
                                            ...(parentChildren || []),
                                            newComment.id as string,
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            }

            try {
                await mutate(
                    FEEDBACK_URL(questionId),
                    feedbackService
                        .modifyFeedback(questionId, updateFeedback)
                        .then(res => {
                            messageConfig({
                                model: Models.COMMENT,
                                status: MessageStatus.SUCCESS,
                                operation: CRUDOperation.CREATE,
                            })
                            return res.data
                        }),
                    {
                        rollbackOnError: true,
                        optimisticData: {
                            ...feedback,
                            resources: feedback.resources.map(r =>
                                r.id === resourceId
                                    ? {
                                          ...r,
                                          comments: [
                                              ...r.comments.map(c =>
                                                  c.id === parentId
                                                      ? {
                                                            ...c,
                                                            childrenComments: [
                                                                ...c.childrenComments,
                                                                newComment.id as string,
                                                            ],
                                                        }
                                                      : c
                                              ),
                                              {
                                                  ...newComment,
                                                  user: session?.user,
                                                  userId: session?.user?.userId,
                                              },
                                          ],
                                      }
                                    : r
                            ),
                        },
                    }
                )
            } catch (err) {
                console.log(`Error trying to create child comment: ${err}`)
                messageConfig({
                    model: Models.COMMENT,
                    status: MessageStatus.ERROR,
                    operation: CRUDOperation.CREATE,
                })
            }
        }
    }

    const createResourceComment = async ({
        comment,
        resourceId,
    }: ICommentForm & { resourceId: string }) => {
        console.log('creating a new resource comment', comment, resourceId)
        try {
            const newComment: Prisma.ResourceCommentsCreateWithoutResourceInput =
                {
                    id: cuid(),
                    created: new Date(),
                    likes: [],
                    dislikes: [],
                    user: {
                        connect: {
                            id: session?.user?.userId,
                        },
                    },
                    comment,
                }

            const updateFeedback: Prisma.QuestionFeedbackUpdateInput = {
                id: questionId,
                resources: {
                    update: {
                        where: {
                            id: resourceId,
                        },
                        data: {
                            comments: {
                                create: newComment,
                            },
                        },
                    },
                },
            }

            await mutate(
                FEEDBACK_URL(questionId),
                feedbackService
                    .modifyFeedback(questionId, updateFeedback)
                    .then(res => {
                        messageConfig({
                            model: Models.COMMENT,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.CREATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: { ...feedback },
                }
            )
        } catch (err) {
            console.log('Error when creating resource comment', err)
            messageConfig({
                model: Models.COMMENT,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.CREATE,
            })
        }
    }

    const createQuestionComment = async ({ comment }: ICommentForm) => {
        try {
            const newComment: Prisma.QuestionCommentsCreateWithoutQuestionFeedbackInput =
                {
                    id: cuid(),
                    created: new Date(),
                    comment,
                    user: {
                        connect: {
                            id: session?.user?.userId,
                        },
                    },
                }

            const updateFeedback: Prisma.QuestionFeedbackUpdateInput = {
                id: questionId,
                comments: {
                    create: newComment,
                },
            }

            await mutate(
                FEEDBACK_URL(questionId),
                feedbackService
                    .modifyFeedback(questionId, updateFeedback)
                    .then(res => {
                        messageConfig({
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.CREATE,
                            model: Models.COMMENT,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...feedback,
                        comments: [
                            ...feedback.comments,
                            {
                                ...newComment,
                                user: session?.user,
                                userId: session?.user?.userId,
                                likes: [],
                                dislikes: [],
                            },
                        ],
                    },
                }
            )
        } catch (err) {
            console.log(`Error creating new comment: ${err}`)
            messageConfig({
                status: MessageStatus.ERROR,
                operation: CRUDOperation.CREATE,
                model: Models.COMMENT,
            })
        }
    }

    const likeDislikeQuestionComment = async ({
        record: comment,
        type,
    }: LikeType<FullQuestionComment>) => {
        const updateLikes = addLikeOrDislike({
            type,
            record: comment,
            userId: session?.user?.userId,
        })
        const likeType = type === LikeActions.LIKE ? 'likes' : 'dislikes'

        //this stops us from having to make a call to backend when our likes didn't really change
        if (comment[likeType].length === updateLikes[likeType].length) {
            return
        }

        const updateComment: Prisma.QuestionFeedbackUpdateInput = {
            id: questionId,
            comments: {
                update: {
                    where: { id: comment.id },
                    data: updateLikes,
                },
            },
        }

        try {
            await mutate(
                FEEDBACK_URL(questionId),
                feedbackService
                    .modifyFeedback(questionId, updateComment)
                    .then(res => {
                        messageConfig({
                            model: Models.FEEDBACK,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...feedback,
                        comments: feedback.comments.map(c =>
                            c.id === comment.id ? { ...c, ...updateLikes } : c
                        ),
                    },
                }
            )
        } catch (err) {
            console.log(`Error updating likes... ${err}`)
            messageConfig({
                model: Models.FEEDBACK,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
        }
    }

    const likeDislikeResourceComment = async ({
        record: comment,
        type,
    }: LikeType<FullResourceComment>) => {
        const updateLikes = addLikeOrDislike({
            type,
            record: comment,
            userId: session?.user?.userId,
        })
        const likeType = type === LikeActions.LIKE ? 'likes' : 'dislikes'

        //this stops us from having to make a call to backend when our likes didn't really change
        if (comment[likeType].length === updateLikes[likeType].length) {
            return
        }

        const updateComment: Prisma.QuestionFeedbackUpdateInput = {
            id: questionId,
            resources: {
                update: {
                    where: {
                        id: comment.resourceId,
                    },
                    data: {
                        comments: {
                            update: {
                                where: {
                                    id: comment.id,
                                },
                                data: updateLikes,
                            },
                        },
                    },
                },
            },
        }

        try {
            await mutate(
                FEEDBACK_URL(questionId),
                feedbackService
                    .modifyFeedback(questionId, updateComment)
                    .then(res => {
                        messageConfig({
                            model: Models.FEEDBACK,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...feedback,
                        resources: feedback.resources.map(r =>
                            r.id === comment.resourceId
                                ? {
                                      ...r,
                                      comments: r.comments.map(c =>
                                          c.id === comment.id
                                              ? { ...c, ...updateLikes }
                                              : c
                                      ),
                                  }
                                : r
                        ),
                    },
                }
            )
        } catch (err) {
            console.log(`Error updating likes... ${err}`)
            messageConfig({
                model: Models.FEEDBACK,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
        }
    }

    const createQuestionFeedback = async () => {
        const newFeedback: Prisma.QuestionFeedbackCreateInput = {
            id: cuid(),
            Question: {
                connect: {
                    id: questionId,
                },
            },
        }

        try {
            await mutate(
                FEEDBACK_URL(questionId),
                feedbackService
                    .createFeedback(questionId, newFeedback)
                    .then(res => {
                        messageConfig({
                            model: Models.FEEDBACK,
                            operation: CRUDOperation.CREATE,
                            status: MessageStatus.SUCCESS,
                        })
                        return res.data
                    }),
                { rollbackOnError: true, optimisticData: { ...newFeedback } }
            )
        } catch (err) {
            console.log(`Error creating question feedback... ${err}`)
        }
    }

    const rateQuestion = async (rating: number) => {
        if (!feedback) {
            await createQuestionFeedback()
        }

        const newRating: Prisma.QuestionRatingCreateWithoutQuestionFeedbackInput =
            {
                id: cuid(),
                rating,
                user: {
                    connect: {
                        id: session?.user?.userId as string,
                    },
                },
            }

        const hasRating = feedback?.rating?.find(
            r => r.userId === session?.user?.userId
        )

        const updateFeedback: Prisma.QuestionFeedbackUpdateInput = {
            id: questionId,
            rating: {
                ...(!hasRating?.id
                    ? { create: newRating }
                    : {
                          update: {
                              where: {
                                  id: hasRating?.id,
                              },
                              data: {
                                  rating,
                              },
                          },
                      }),
            },
        }

        try {
            await mutate(
                FEEDBACK_URL(questionId),
                feedbackService
                    .modifyFeedback(questionId, updateFeedback)
                    .then(res => {
                        messageConfig({
                            model: Models.RATING,
                            status: MessageStatus.SUCCESS,
                            operation: hasRating
                                ? CRUDOperation.UPDATE
                                : CRUDOperation.CREATE,
                        })
                        return res.data
                    })
            )
        } catch (err) {
            console.log(`Error trying to rate question... ${err}`)
            messageConfig({
                status: MessageStatus.ERROR,
                operation: CRUDOperation.CREATE,
                model: Models.RATING,
            })
        }

        console.log('this is our new rating', newRating)
    }

    const createQuestionResource = async (val: IResourceForm) => {
        console.log('val', session?.user)
        const newFeedback: Prisma.QuestionFeedbackUpdateInput = {
            id: feedback.id,
            resources: {
                create: {
                    id: cuid(),
                    created: new Date(),
                    likes: [],
                    dislikes: [],
                    user: {
                        connect: {
                            id: session?.user?.userId,
                        },
                    },
                    ...val,
                },
            },
        }

        try {
            await mutate(
                FEEDBACK_URL(questionId),
                feedbackService
                    .modifyFeedback(questionId, newFeedback)
                    .then(res => {
                        messageConfig({
                            model: Models.RESOURCES,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.CREATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...feedback,
                        resources: [
                            ...feedback?.resources,
                            {
                                ...newFeedback.resources?.create,
                                user: session?.user,
                                userId: session?.user?.userId,
                            },
                        ],
                    } as FullQuestionFeedback,
                }
            )
        } catch (err) {
            console.log(`Error creating resource - ${err}`)
            messageConfig({
                model: Models.RESOURCES,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.CREATE,
            })
        }
    }

    const likeDislikeResource = async ({
        record: resource,
        type,
    }: LikeType<ResourceWithComments>) => {
        const updateLikes = addLikeOrDislike({
            type,
            record: resource,
            userId: session?.user?.userId,
        })

        const likeType = type === LikeActions.LIKE ? 'likes' : 'dislikes'

        //if we didn't really need to change anything, then lets just return
        if (resource[likeType].length === updateLikes[likeType].length) {
            return
        }

        const updateResource: Prisma.QuestionFeedbackUpdateInput = {
            id: questionId,
            resources: {
                update: {
                    where: {
                        id: resource.id,
                    },
                    data: updateLikes,
                },
            },
        }

        try {
            await mutate(
                FEEDBACK_URL(questionId),
                feedbackService
                    .modifyFeedback(questionId, updateResource)
                    .then(res => {
                        messageConfig({
                            model: Models.RESOURCES,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...feedback,
                        resources: feedback.resources.map(r =>
                            r.id === resource.id
                                ? {
                                      ...r,
                                      ...updateLikes,
                                  }
                                : r
                        ),
                    },
                }
            )
        } catch (e) {
            console.log(`Error trying to like or dislike resource... ${e}`)
            messageConfig({
                model: Models.RESOURCES,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
        }
    }

    const editQuestionResource = async (
        val: IResourceForm & { resourceId: string }
    ) => {
        const updateFeedback: Prisma.QuestionFeedbackUpdateInput = {
            id: questionId,
            resources: {
                update: {
                    where: {
                        id: val.resourceId,
                    },
                    data: {
                        title: val.title,
                        description: val.description,
                        location: val.location,
                    },
                },
            },
        }
        try {
            await mutate(
                FEEDBACK_URL(questionId),
                feedbackService
                    .modifyFeedback(questionId, updateFeedback)
                    .then(res => {
                        messageConfig({
                            model: Models.RESOURCES,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: {
                        ...feedback,
                        resources: feedback.resources.map(r =>
                            r.id === val.resourceId ? { ...r, ...val } : r
                        ),
                    },
                }
            )
        } catch (e) {
            console.log(`Error trying to update question resource - ${e}`)
            messageConfig({
                model: Models.RESOURCES,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
        }
    }

    return {
        createComment: createQuestionComment,
        likeDislikeQuestionComment,
        likeDislikeResourceComment,
        createQuestionFeedback,
        createQuestionChildComment,
        rateQuestion,
        createQuestionResource,
        likeDislikeResource,
        editQuestionResource,
        createResourceComment,
        createResourceChildComment,
    }
}
