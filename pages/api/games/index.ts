import prisma from '@/prisma/prisma'
import { GameTypes } from '@prisma/client'
import { apiHandler } from 'server/apiHandler'
import { createFreeGame, createFreeGameSchema } from 'server/gameSessions'
import { gameWithQuestionsOptions, orderGameQuestions } from 'server/gameShapes'
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    if (req.method === 'GET') {
        const games = await prisma.gameSession.findMany({
            where: { userId: viewer.userId, type: GameTypes.FREE },
            ...gameWithQuestionsOptions,
        })
        res.json(games.map(orderGameQuestions))
    } else
        res.status(201).json(
            await createFreeGame(
                viewer.userId,
                createFreeGameSchema.parse(req.body)
            )
        )
})
