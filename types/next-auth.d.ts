import { DefaultSession } from 'next-auth'
import { User as PrismaUser, Roles, Teams } from '@prisma/client'

//https://next-auth.js.org/getting-started/typescript#extend-default-interface-properties

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            //ADMIN or USER
            role: Roles
            //our user id, so we don't have to call the db so often.
            userId: string
            //our team
            team: Teams
        } & DefaultSession['user']
    }

    interface User extends PrismaUser {}
}
