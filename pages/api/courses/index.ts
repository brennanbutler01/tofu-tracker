import { NextApiRequest, NextApiResponse } from 'next'

import { Methods } from '@/services/http'
import { Prisma } from '@prisma/client'
import { getSession } from 'next-auth/react'
import prisma from '@/prisma/prisma'

export const coursesWithDecks = Prisma.validator<Prisma.CourseDefaultArgs>()({
    include: {
        decks: {
            include: {
                questions: true,
            },
        },
    },
})

export type CourseWithDecks = Prisma.CourseGetPayload<typeof coursesWithDecks>

//todo - fix this tomorrow - make our courses decks work also
export const getCourses = async (): Promise<Array<CourseWithDecks>> =>
    await prisma.course.findMany({
        ...coursesWithDecks,
        orderBy: {
            created: 'asc',
        },
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req

    if (session) {
        switch (method) {
            case Methods.GET:
                try {
                    const courses = await getCourses()
                    res.status(200).json(courses)
                } catch (err) {
                    console.log('Error fetching courses', err)
                    res.status(403).json({
                        err: `Error fetching courses: ${err}`,
                    })
                }
                break
            case Methods.POST:
                try {
                    const courses = await prisma.course.create({
                        data: req.body,
                        ...coursesWithDecks,
                    })
                    res.status(200).json(courses)
                } catch (err) {
                    console.log('Error creating new course', err)
                    res.status(403).json({
                        err: `Error creating new course ${err}`,
                    })
                }
                break
            default:
                console.log(
                    `This api endpoint does not accept ${method} requests`
                )
                res.status(403).json({
                    err: `Error   - This api endpoint does not accept ${method} requests`,
                })
        }
    } else {
        res.status(401).json({
            err: 'This api endpoint requires authorization to view - Please sign in.',
        })
    }
}

export default handler
