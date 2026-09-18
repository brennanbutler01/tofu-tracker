import type { NextApiRequest, NextApiResponse } from 'next'
import { Roles, Teams } from '@prisma/client'
import type { User } from '@prisma/client'
import { z } from 'zod'

export interface Viewer {
    userId: string
    role: Roles
    isVisitor?: boolean
}
export interface ProfileUpdate {
    name?: string
    role?: Roles
    team?: Teams
}
export interface UserRepository {
    find: (id: string) => Promise<User | null>
    list: () => Promise<User[]>
    update: (id: string, data: ProfileUpdate) => Promise<User>
    remove: (id: string) => Promise<void>
}
interface Dependencies {
    getViewer: (
        req: NextApiRequest,
        res: NextApiResponse
    ) => Promise<Viewer | null>
    repository: UserRepository
    reportError: (error: unknown) => void
}
const profileSchema = z
    .object({
        name: z.string().trim().min(1).max(100).optional(),
    })
    .strict()
const administratorSchema = profileSchema.extend({
    role: z.nativeEnum(Roles).optional(),
    team: z.nativeEnum(Teams).optional(),
})

export function createUserHandler({
    getViewer,
    repository,
    reportError,
}: Dependencies) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        if (!['GET', 'PUT', 'DELETE'].includes(req.method ?? '')) {
            res.setHeader('Allow', 'GET, PUT, DELETE')
            return void res.status(405).json({ error: 'Method not allowed' })
        }
        try {
            const viewer = await getViewer(req, res)
            if (!viewer)
                return void res.status(401).json({ error: 'Sign in required' })
            const id = req.query.id
            if (typeof id !== 'string' || !id)
                return void res
                    .status(400)
                    .json({ error: 'Invalid user identifier' })
            const isAdministrator =
                viewer.role === Roles.ADMIN && !viewer.isVisitor
            if (
                (!isAdministrator && id !== viewer.userId) ||
                (req.method === 'DELETE' && !isAdministrator)
            ) {
                return void res.status(403).json({ error: 'Access denied' })
            }
            if (req.method === 'PUT') {
                const parsed = (
                    isAdministrator ? administratorSchema : profileSchema
                ).safeParse(req.body)
                if (!parsed.success || !Object.keys(parsed.data).length) {
                    return void res
                        .status(400)
                        .json({ error: 'Invalid profile changes' })
                }
                if (!(await repository.find(id)))
                    return void res
                        .status(404)
                        .json({ error: 'User not found' })
                return void res
                    .status(200)
                    .json(await repository.update(id, parsed.data))
            }
            const user = await repository.find(id)
            if (!user)
                return void res.status(404).json({ error: 'User not found' })
            if (req.method === 'GET')
                return void res
                    .status(200)
                    .json(viewer.isVisitor ? [user] : user)
            if (id === viewer.userId)
                return void res
                    .status(400)
                    .json({
                        error: 'Administrators cannot delete their own account',
                    })
            await repository.remove(id)
            return void res.status(204).end()
        } catch (error) {
            reportError(error)
            return void res
                .status(500)
                .json({ error: 'Unable to complete user request' })
        }
    }
}

export function createUsersHandler({
    getViewer,
    repository,
    reportError,
}: Dependencies) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        if (req.method !== 'GET') {
            res.setHeader('Allow', 'GET')
            return void res.status(405).json({ error: 'Method not allowed' })
        }
        try {
            const viewer = await getViewer(req, res)
            if (!viewer)
                return void res.status(401).json({ error: 'Sign in required' })
            if (viewer.role === Roles.ADMIN && !viewer.isVisitor)
                return void res.status(200).json(await repository.list())
            const user = await repository.find(viewer.userId)
            if (!user)
                return void res.status(404).json({ error: 'User not found' })
            res.status(200).json(viewer.isVisitor ? [user] : user)
        } catch (error) {
            reportError(error)
            return void res.status(500).json({ error: 'Unable to load users' })
        }
    }
}
