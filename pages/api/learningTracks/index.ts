import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { Prisma } from '@prisma/client'

export const learningTrackWithOrderedCourses =
    Prisma.validator<Prisma.LearningTrackDefaultArgs>()({
        include: {
            courseOrder: {
                include: {
                    course: true,
                },
                orderBy: {
                    index: 'asc',
                },
            },
        },
    })

export type LearningTrackWithOrderedCourses = Prisma.LearningTrackGetPayload<
    typeof learningTrackWithOrderedCourses
>

export const getLearningTracks = async (): Promise<
    Array<LearningTrackWithOrderedCourses>
> =>
    await prisma.learningTrack.findMany({
        ...learningTrackWithOrderedCourses,
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req
    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const learningTracks = await getLearningTracks()
                    res.status(200).json(learningTracks)
                } catch (err) {
                    console.log(
                        'There was an error trying to fetch our course series...',
                        err
                    )
                    res.status(403).json({
                        err: `Error trying to fetch our course series - ${err}`,
                    })
                }
                break
            case Methods.POST:
                try {
                    const learningTracks = await prisma.learningTrack.create({
                        data: req.body,
                    })
                    res.status(200).json(learningTracks)
                } catch (err) {
                    console.log(
                        'There was an error trying to create course series',
                        err
                    )
                    res.status(403).json({
                        err: `Error trying to create new Course Series ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `This api endpoint does not support ${method} requests`,
                })
        }
    } else {
        res.status(401).json({
            err: 'You must be authorized to view this endpoint.',
        })
    }
}

export default handler
