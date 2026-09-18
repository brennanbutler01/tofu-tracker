import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
type GlobalPrisma = typeof globalThis & { prisma?: PrismaClient }

let prisma: PrismaClient

// this checks to make sure that we don't open unnecessary connections to prisma db
// & allows us to more easily access db through the exported prisma variable.

if (process.env.NODE_ENV === 'production') {
    //if we are in production, we will always provide a client
    prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    })
} else {
    //if we are in development, we will check and see if we already have a connection
    if (!(global as GlobalPrisma).prisma) {
        //if we don't, we will make a new client
        ;(global as GlobalPrisma).prisma = new PrismaClient({
            adapter: new PrismaPg({
                connectionString: process.env.DATABASE_URL,
            }),
        })
    }

    //set our client to be equal either to our newly created one or the existing one.
    prisma = (global as GlobalPrisma).prisma as PrismaClient
}

export default prisma
