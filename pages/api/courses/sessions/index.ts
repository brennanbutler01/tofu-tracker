import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'

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
                    })
                    res.status(200).json(courseSessions)
                } catch (err) {
                    console.log(
                        'There was an error trying to get course sessions...',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error trying to get course sessions... ${err}`,
                    })
                }
                break
            case Methods.POST:
                try {
                } catch (err) {
                    console.log(
                        'There was an error trying to create a new course session',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error trying to create a new course session... ${err}`,
                    })
                }
        }
    } else {
        res.status(401).json({
            err: 'You must be authorized to view this endpoint',
        })
    }
}
