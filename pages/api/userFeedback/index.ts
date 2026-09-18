import prisma from '@/prisma/prisma'
import { Methods } from '@/services/http'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export const getFeedback = async () => await prisma.userFeedback.findMany({})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req
    const session = await getSession({ req })

    if (session?.user) {
        switch (method) {
            case Methods.GET:
                try {
                    const feedback = await getFeedback()
                    res.status(200).json(feedback)
                } catch (err) {
                    console.log(
                        'There was an error getting user feedback - ',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error getting user feedback - ${err}`,
                    })
                }
                break
            case Methods.POST:
                try {
                    const newFeedback = await prisma.userFeedback.create({
                        data: req.body,
                    })
                    res.status(200).json(newFeedback)
                } catch (err) {
                    res.status(403).json({
                        err: `There was an error creating feedback - ${err}`,
                    })
                }
        }
    } else {
        res.status(401).json({
            err: 'You must be authorized to view this api endpoint.',
        })
    }
}
export default handler
