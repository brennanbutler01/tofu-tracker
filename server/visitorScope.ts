import type { Prisma } from '@prisma/client'
import { visitorEnabled } from './visitorAccess'

export function visitorOwnerScope(userId: string): { ownerId?: string } {
    if (!visitorEnabled) return {}
    if (!userId) throw new Error('Visitor scope requires an authenticated user')
    return { ownerId: userId }
}
export function visitorDeckScope(userId: string): { userId?: string } {
    if (!visitorEnabled) return {}
    if (!userId) throw new Error('Visitor scope requires an authenticated user')
    return { userId }
}
export function visitorQuestionScope(
    userId: string
): Prisma.QuestionWhereInput {
    if (!visitorEnabled) return {}
    if (!userId) throw new Error('Visitor scope requires an authenticated user')
    return { OR: [{ deck: { userId } }, { Activity: { ownerId: userId } }] }
}
