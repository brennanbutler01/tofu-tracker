import prisma from '@/prisma/prisma'
import { Methods } from '@/services/http'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export interface IQuestionStats {
    question: string
    correct: number
    incorrect: number
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })
    const { method } = req
    const idArray = req.query.id

    if (session?.user?.userId) {
        switch (method) {
            case Methods.GET:
                try {
                    const questions = await prisma.$queryRaw`
            SELECT "Question"."question", COUNT(CASE WHEN "isCorrect" = 'TRUE' THEN 1 END)::INT as "correct",
            COUNT(CASE WHEN "isCorrect" = 'FALSE' THEN 1 END)::INT as "incorrect"
            FROM "GameAnswer", "Question"
            WHERE "Question"."id" = ANY(${idArray})
            GROUP BY  "Question"."id"`
                    console.log('id array', idArray, 'questions', questions)
                    res.status(200).json(questions)
                } catch (err) {
                    res.status(403).json({ err: `Error - ${err}` })
                }
                break
            default:
                res.status(403).json({
                    err: `There was an error trying to fetch question stats - ${method} is not allowed`,
                })
        }
    } else {
        res.status(401).json({
            err: 'You must be authorized to view this api endpoint',
        })
    }
}
export default handler
