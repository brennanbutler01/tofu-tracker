import prisma from '@/prisma/prisma'
import type { UserRepository } from './userHandlers'

export const userRepository: UserRepository = {
    find: id => prisma.user.findUnique({ where: { id } }),
    list: () => prisma.user.findMany(),
    update: (id, data) => prisma.user.update({ where: { id }, data }),
    remove: async id => { await prisma.user.delete({ where: { id } }) },
}
