import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/prisma/prisma'
import { FullQuestionFeedback } from '@/services/feedback/useFeedbackSWR'
import { Methods } from '@/services/http'
import { getSession } from 'next-auth/react'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {
        query: { id },
        method,
    } = req
    const session = await getSession({ req })

    if (session?.user?.userId) {
        switch (method) {
            case Methods.POST:
                try {
                    const questionFeedback: FullQuestionFeedback =
                        await prisma.questionFeedback.create({
                            data: req.body,
                            include: {
                                comments: {
                                    include: {
                                        user: true,
                                    },
                                    orderBy: {
                                        created: 'asc',
                                    },
                                },
                                rating: true,
                                resources: {
                                    include: {
                                        user: true,
                                        comments: {
                                            include: {
                                                user: true,
                                            },
                                            orderBy: {
                                                created: 'asc',
                                            },
                                        },
                                    },
                                },
                            },
                        })
                    res.status(200).json(questionFeedback)
                } catch (err) {
                    console.log('error creating question feedback...', err)
                    res.status(403).json({
                        err: `Error creating question feedback... ${err}`,
                    })
                }
                break
            case Methods.GET:
                try {
                    const questionFeedback: FullQuestionFeedback | null =
                        await prisma.questionFeedback.findUnique({
                            where: { questionId: id as string },
                            include: {
                                comments: {
                                    include: {
                                        user: true,
                                    },
                                    orderBy: {
                                        created: 'asc',
                                    },
                                },
                                rating: true,
                                resources: {
                                    include: {
                                        comments: {
                                            include: {
                                                user: true,
                                            },
                                            orderBy: {
                                                created: 'asc',
                                            },
                                        },
                                        user: true,
                                    },
                                },
                            },
                        })
                    res.status(200).json(questionFeedback)
                } catch (err) {
                    res.status(403).json({
                        err: `Error fetching feedback for question ${id} ... Error: ${err}`,
                    })
                }
                break
            case Methods.PUT:
                try {
                    const updatedFeedback: FullQuestionFeedback =
                        await prisma.questionFeedback.update({
                            where: { questionId: id as string },
                            data: req.body,
                            include: {
                                comments: {
                                    include: {
                                        user: true,
                                    },
                                },
                                rating: true,
                                resources: {
                                    include: {
                                        user: true,
                                        comments: {
                                            include: {
                                                user: true,
                                            },
                                        },
                                    },
                                },
                            },
                        })
                    console.log('updated feedback', updatedFeedback)
                    res.status(200).json(updatedFeedback)
                } catch (err) {
                    console.log(`Error updating question feedback: ${err}`)
                    res.status(403).json({
                        err: `Error updating question feedback: ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `Method ${method} is not supported by this api endpoint. Please just submit get, post, and put requests`,
                })
        }
    } else {
        res.status(401).json({
            err: `This API endpoint requires authentication. Please sign-in to view.`,
        })
    }
}
