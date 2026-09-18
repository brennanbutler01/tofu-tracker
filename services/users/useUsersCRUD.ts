import { useUsersSWR } from '@/services/users/useUsersSWR'
import { useSWRConfig } from 'swr'
import { userService } from '@/services/users/userService'
import { Roles, Teams } from '@prisma/client'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { printError } from '@/utils/printError.utils'
import { useSession } from 'next-auth/react'
import { useSingleUserSWR } from './useSingleUserSWR'
import { useRouter } from 'next/router'

interface IUserRole {
    id: string
    role: Roles
}

export const USERS_URL = '/api/users'

export const useUsersCRUD = () => {
    const ourUsers = useUsersSWR()
    const { mutate } = useSWRConfig()
    const session = useSession()
    const {
        query: { id },
    } = useRouter()
    const singleUser = useSingleUserSWR({ id: id as string })

    //assign the user to a team
    const changeUserTeam = async ({
        team,
        id,
    }: {
        team: Teams
        id: string
    }) => {
        console.log('team', team, 'id', id)
        try {
            await mutate(
                USERS_URL,
                userService.updateUser({ id, team }).then(res => {
                    messageConfig({
                        model: Models.USERS,
                        status: MessageStatus.SUCCESS,
                        operation: CRUDOperation.UPDATE,
                    })
                    return ourUsers.map(u => (u.id === id ? { ...u, team } : u))
                }),
                {
                    rollbackOnError: true,
                    optimisticData: ourUsers.map(u =>
                        u.id === id ? { ...u, team } : u
                    ),
                }
            )
        } catch (err) {
            console.log('Error trying to update the users team')
            messageConfig({
                model: Models.USERS,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
        }
    }

    //make user an admin
    const changeUserRole = async ({ role, id }: IUserRole) => {
        try {
            await mutate(
                USERS_URL,
                userService
                    .updateUser({
                        id,
                        role: role === Roles.ADMIN ? Roles.USER : Roles.ADMIN,
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.USERS,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        console.log(res.data)
                        return ourUsers?.map(u => (u.id === id ? res.data : u))
                    }),
                {
                    rollbackOnError: true,
                    optimisticData: ourUsers?.map(u =>
                        u.id === id
                            ? {
                                  ...u,
                                  role:
                                      u.role === Roles.ADMIN
                                          ? Roles.USER
                                          : Roles.ADMIN,
                              }
                            : u
                    ),
                }
            )
        } catch (err) {
            messageConfig({
                model: Models.USERS,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
            console.log('Error attempting to promote user', err)
        }
    }

    const deleteUser = async (id: string) => {
        try {
            await mutate(
                USERS_URL,
                userService.deleteUser({ id }).then(res => {
                    messageConfig({
                        model: Models.USERS,
                        status: MessageStatus.SUCCESS,
                        operation: CRUDOperation.DELETE,
                    })
                    return ourUsers?.filter(u => u.id !== id)
                }),
                {
                    rollbackOnError: true,
                    optimisticData: ourUsers?.filter(u => u.id !== id),
                }
            )
        } catch (err) {
            console.log('Error deleting user...', err)
            messageConfig({
                model: Models.USERS,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.DELETE,
            })
        }
    }

    const updateProfile = async ({
        id,
        name,
    }: {
        id: string
        name: string
    }) => {
        try {
            await mutate(
                `${USERS_URL}/${id}`,
                userService.updateUser({ id, name }).then(() => {
                    messageConfig({
                        model: Models.USERS,
                        operation: CRUDOperation.UPDATE,
                        status: MessageStatus.SUCCESS,
                    })
                    return { ...singleUser, name }
                }),
                {
                    rollbackOnError: true,
                    optimisticData: { ...singleUser, name },
                }
            )
            return true
        } catch (err) {
            console.log('err', err)
            await printError({
                model: Models.USERS,
                err,
                operation: CRUDOperation.UPDATE,
            })
            return false
        }
    }

    return { changeUserRole, deleteUser, changeUserTeam, updateProfile }
}
