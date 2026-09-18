import prisma from '@/prisma/prisma'
import { Methods } from '@/services/http'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { activityWithQuestions } from '.'

export const getActivity = async (id: string) =>
    await prisma.activity.findUnique({
        where: { id },
        ...activityWithQuestions,
    })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req

    const id = req.query.id as string
    console.log('session', session, req.query)
    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const activity = await getActivity(req.query.id as string)
                    res.status(200).json(activity)
                } catch (err) {
                    console.log(
                        'There was an error getting the activity --- ',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error getting the activity - ${err}`,
                    })
                }
                break
            case Methods.DELETE:
                try {
                    const deletedActivity = await prisma.activity.delete({
                        where: {
                            id,
                        },
                    })
                    res.status(200).json(deletedActivity)
                } catch (err) {
                    console.log('There was an error deleting activity - ', err)
                    res.status(403).json({
                        err: `There was an error deleting this activity - ${err}`,
                    })
                }
                break
            case Methods.PUT:
                console.log('putting', req.body)
                try {
                    const updatedActivity = await prisma.activity.update({
                        where: {
                            id,
                        },
                        data: req.body,
                    })
                    res.status(200).json(updatedActivity)
                } catch (err) {
                    console.log(
                        `There was an error trying to update this activity - ${err}`
                    )
                    res.status(403).json({
                        err: `There was an error trying to update this activity- ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err:
                        'This api endpoint does not accept ' +
                        method +
                        ' requests',
                })
        }
    } else {
        res.status(401).json({
            err: 'You must be authorized to view this api endpoint',
        })
    }
}

export default handler
