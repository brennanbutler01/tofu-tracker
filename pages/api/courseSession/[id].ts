import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { Prisma } from '@prisma/client'
import { gameWithQuestionsOptions } from '@/pages/api/games/[id]'

export const fullCourseSession = Prisma.validator<Prisma.CourseSessionDefaultArgs>()({
    include: {
        course: true,
        gameSession: {
            ...gameWithQuestionsOptions,
        },
    },
})

export type FullCourseSession = Prisma.CourseSessionGetPayload<
    typeof fullCourseSession
>

export const getCourseSession = async (id: string) =>
    await prisma.courseSession.findUnique({
        where: {
            id: id as string,
        },
        ...fullCourseSession,
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req
    const session = await getSession({ req })
    const { id } = req.query

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const courseSession = await getCourseSession(id as string)
                    res.status(200).json(courseSession)
                } catch (err) {
                    console.log('Error trying to get course session...', err)
                    res.status(403).json({
                        err: `Error trying to get course session - ${err}`,
                    })
                }
                break
            case Methods.PUT:
                try {
                    const courseSession = await prisma.courseSession.update({
                        where: {
                            id: id as string,
                        },
                        data: {
                            ...req.body,
                        },
                        ...fullCourseSession,
                    })
                    res.status(200).json(courseSession)
                } catch (err) {
                    console.log(
                        'There was an error trying to update course session ',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error trying to update course session: ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `This api endpoint does not accept ${method} requests`,
                })
        }
    } else {
        res.status(401).json({
            err: 'You need to  be authorized to view this api endpoint',
        })
    }
}

export default handler
