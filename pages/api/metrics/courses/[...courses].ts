import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req
    const courses = req.query.courses
    if (!Array.isArray(courses) || !courses.length) return void res.status(400).json({ error: 'Provide course identifiers' })
    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const mew = [
                        'cl4yp8vwz0004206k37fdvhpp',
                        'cl565yg170000206j3q8nu29o',
                    ]
                    console.log('courses', courses)
                    const courseMetrics =
                        await prisma.$queryRaw`SELECT (c.title), (COUNT(*) filter (where passed))::int as "passed", (COUNT(*) filter (where not passed))::int as "failed"  FROM "CourseSession" cs, "Course" c WHERE "courseId"= ANY(${
                            courses
                        }) GROUP BY (c.title) `
                    res.status(200).json(courseMetrics)
                } catch (err) {
                    console.log(
                        'there was an error trying to get course metrics ',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error trying to get course metrics - ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: 'This endpoint only accepts get requests',
                })
        }
    } else {
        res.status(401).json({
            err: 'You must be authenticated to view this api endpoint.',
        })
    }
}

import prisma from '@/prisma/prisma'

export default handler
