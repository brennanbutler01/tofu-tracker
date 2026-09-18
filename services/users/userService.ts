import type { Roles, Teams } from '@prisma/client'
import { http } from '../http'

interface ProfileChanges { id: string; name?: string; role?: Roles; team?: Teams }

class UserService {
    updateUser = async ({ id, ...changes }: ProfileChanges) =>
        http.put(`/users/${encodeURIComponent(id)}`, changes)
    deleteUser = async ({ id }: { id: string }) =>
        http.delete(`/users/${encodeURIComponent(id)}`)
}

export const userService = new UserService()
