import { NextApiHandler } from 'next'
import { Methods } from '@/services/http'
import prisma from '@/prisma/prisma'
import { getSession } from 'next-auth/react'

const handler: NextApiHandler = async (req, res) => {
    const { deckId } = req.query
    const { method } = req
    const session = await getSession({ req })

    if (session?.user) {
        if (deckId) {
            switch (method) {
                case Methods.GET:
                    try {
                        const deckQuestions = await prisma.question.findMany({
                            where: {
                                deckId: deckId as string,
                            },
                        })
                        console.log('deckQuestions', deckQuestions.length)
                        res.status(200).json(deckQuestions)
                    } catch (err) {
                        console.log('error fetching decks questions', err)
                        res.status(403).json({
                            err: `Error fetching questions for Deck, ${err}`,
                        })
                    }
                    break
            }
        } else {
            console.log('no deckId provided')
            res.status(403).json({
                error: `Please provide a deck ID to fetch that decks questions.`,
            })
        }
    } else {
        res.status(401).json({
            err: 'You must be an authorized user to view this endpoint. Please sign-in',
        })
    }
}

export default handler
