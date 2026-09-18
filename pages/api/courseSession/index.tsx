import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { fullCourseSession } from '@/pages/api/courseSession/[id]'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req
    const session = await getSession({ req })

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const courseSessions = await prisma.courseSession.findMany({
                        where: {
                            userId: session?.user?.userId,
                        },
                        ...fullCourseSession,
                    })
                    res.status(200).json(courseSessions)
                } catch (err) {
                    console.log(
                        'There was an error trying to get courses...',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error trying to get course sessions ${err}`,
                    })
                }
                break
            case Methods.POST:
                try {
                    const newCourseSession = await prisma.courseSession.create({
                        data: req.body,
                    })
                    res.status(200).json(newCourseSession)
                } catch (err) {
                    res.status(403).json({
                        err: `There was an error tryign to create a course session - ${err}`,
                    })
                }
        }
    } else {
        res.status(401).json({
            err: 'You are not authorized to view this endpoint.',
        })
    }
}
export default handler
