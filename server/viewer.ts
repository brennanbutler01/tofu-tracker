import { getServerSession } from 'next-auth/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Roles } from '@prisma/client'
import { authOptions } from './authOptions'

export async function getViewer(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
    const user = session?.user
    if (!user?.userId || ![Roles.ADMIN, Roles.USER].includes(user.role)) return null
    return { userId: user.userId, role: user.role }
}
