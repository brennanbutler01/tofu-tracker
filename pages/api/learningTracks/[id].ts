import { NextApiRequest, NextApiResponse } from 'next'

import { Methods } from '@/services/http'
import { getSession } from 'next-auth/react'
import prisma from '@/prisma/prisma'
import { learningTrackWithOrderedCourses } from '@/pages/api/learningTracks/index'

export const findOneTrack = async (id: string) =>
    await prisma.learningTrack.findUnique({
        where: {
            id,
        },
        ...learningTrackWithOrderedCourses,
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query
    const { method } = req
    const session = await getSession({ req })

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const track = await findOneTrack(id as string)
                    res.status(200).json(track)
                } catch (err) {
                    console.log(
                        'There was an error trying to get this learning track',
                        err
                    )
                    res.status(403).json({
                        err: 'Error trying to get learning track - ${err',
                    })
                }
                break
            case Methods.DELETE:
                try {
                    const tracks = await prisma.learningTrack.delete({
                        where: {
                            id: id as string,
                        },
                        ...learningTrackWithOrderedCourses,
                    })
                    res.status(200).json(tracks)
                } catch (err) {
                    console.log(
                        `Error trying to delete the learning track - ${err}`
                    )
                    res.status(403).json({
                        err: `Error trying to delete learning track - ${err}`,
                    })
                }
                break
            case Methods.PUT:
                try {
                    console.log('body', req.body?.courseOrder?.updateMany)
                    const updatedTrack = await prisma.learningTrack.update({
                        where: {
                            id: id as string,
                        },
                        data: req.body,
                        ...learningTrackWithOrderedCourses,
                    })
                    res.status(200).json(updatedTrack)
                } catch (err) {
                    console.log(
                        'There was an error trying to update learning track',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error trying to update learning track ${err}`,
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
            err: `You are not authorized to view this api endpoint`,
        })
    }
}

export default handler
