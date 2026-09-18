import { NextApiHandler } from 'next'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { getSession } from 'next-auth/react'

const handler: NextApiHandler = async (req, res) => {
    const { method } = req
    const session = await getSession({ req })

    if (session?.user) {
        switch (method) {
            case Methods.GET:
                try {
                    const questions = await prisma.question.findMany()

                    res.status(200).json(questions)
                } catch (err) {
                    res.status(403).json({
                        err: `Error while getting questions : Error: ${err}`,
                    })
                }
                break
            case Methods.POST:
                try {
                    const newQuestion = await prisma.question.create({
                        data: {
                            ...req.body,
                        },
                    })

                    res.status(200).json(newQuestion)
                } catch (err) {
                    console.log(err)
                    res.status(403).json({
                        err: `Error while creating question. Error : ${err}`,
                    })
                }
                break
            default:
                res.status(403).json({
                    err: `${method} requests are not supported by this api endpoint.`,
                })
        }
    } else {
        res.status(401).json({
            err: 'You must be an authorized user to view this endpoint. Please sign-in',
        })
    }
}

export default handler
