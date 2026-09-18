import prisma from '@/prisma/prisma'
import { Methods } from '@/services/http'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export interface IQuestionStatsByUser {
    correct: number
    incorrect: number
    question: string
    email: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method, query } = req

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const question =
                        await prisma.$queryRaw`SELECT COUNT(CASE WHEN "isCorrect" = 'TRUE' THEN 1 END)::INT as "correct", COUNT(CASE WHEN "isCorrect" = 'FALSE' THEN 1 END)::INT as "incorrect", "u"."email" FROM "GameAnswer" ga, "Question" q, "User" u WHERE "q"."id" = ${query.id} GROUP BY  "u"."email" `
                    res.status(200).json(question)
                } catch (err) {
                    console.log(
                        'There was an error getting the data for this question',
                        err
                    )
                    res.status(403).json({
                        err: `There was an error getting the data for this question - ${err}`,
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
            err: 'You need to be authorized to view this endpoint please.',
        })
    }
}
export default handler
