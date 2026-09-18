import prisma from '@/prisma/prisma'
import { apiHandler } from 'server/apiHandler'
export default apiHandler(['GET'], async (req, res, viewer) => {
    res.json(
        await prisma.courseSession.findMany({
            where: { userId: viewer.userId },
        })
    )
})
