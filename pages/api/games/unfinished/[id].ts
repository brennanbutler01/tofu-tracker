import prisma from '@/prisma/prisma'
import { GameTypes } from '@prisma/client'
import { apiHandler, identifier, RequestError } from 'server/apiHandler'
export default apiHandler(['DELETE'], async (req, res, viewer) => {
    const id = identifier.parse(req.query.id)
    const deleted = await prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "GameSession" WHERE id = ${id} AND "userId" = ${viewer.userId} FOR UPDATE`
        const game = await tx.gameSession.findFirst({
            where: {
                id,
                userId: viewer.userId,
                type: GameTypes.FREE,
                isComplete: false,
            },
            include: {
                questions: true,
                answerHistory: { select: { answerOptionId: true } },
            },
        })
        if (!game) throw new RequestError(404, 'Unfinished game not found')
        await tx.gameSession.delete({ where: { id } })
        await tx.answerOption.deleteMany({
            where: {
                id: {
                    in: game.answerHistory.flatMap(a =>
                        a.answerOptionId ? [a.answerOptionId] : []
                    ),
                },
                questionId: null,
                GameAnswer: { none: {} },
                GradingCritique: { none: {} },
            },
        })
        return game
    })
    res.json(deleted)
})
