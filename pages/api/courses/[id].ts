import { NextApiRequest, NextApiResponse } from 'next'

import { coursesWithDecks, CourseWithDecks } from '.'
import { Methods } from '@/services/http'
import { getSession } from 'next-auth/react'
import prisma from '@/prisma/prisma'

export const getCourse = async (id: string): Promise<CourseWithDecks | null> =>
    await prisma.course.findUnique({
        where: {
            id,
        },
        ...coursesWithDecks,
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req
    const { id } = req.query
    if (session) {
        switch (method) {
            case Methods.GET:
                try {
                    const course = await getCourse(id as string)
                    res.status(200).json(course)
                } catch (err) {
                    console.log(
                        'There was an error trying to fetch this course - ',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error trying to fetch this course - ${err}`,
                    })
                }
                break
            case Methods.DELETE:
                try {
                    const deleteCourse = await prisma.course.delete({
                        where: {
                            id: id as string,
                        },
                    })
                    res.status(200).json(deleteCourse)
                } catch (err) {
                    res.status(403).json({
                        err: `Error deleting course ${err}`,
                    })
                }
                break
            case Methods.PUT:
                try {
                    const updateCourse = await prisma.course.update({
                        where: {
                            id: id as string,
                        },
                        data: req.body,
                    })
                    res.status(200).json(updateCourse)
                } catch (err) {
                    console.log('ERror trying to update course - ', err)
                    res.status(403).json({
                        err: `Error trying to update course: ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `This api endpoint does not accept ${method} requests.`,
                })
        }
    } else {
        res.status(401).json({
            err: 'You must be authorized to access this endpoint',
        })
    }
}

export default handler
