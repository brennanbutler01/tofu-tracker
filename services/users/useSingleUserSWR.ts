import { User } from '@prisma/client'
import useSWR from 'swr'

interface IUseSingularUser {
    id: string
    fallbackData?: User
}

export const useSingleUserSWR = ({ id, fallbackData }: IUseSingularUser) => {
    const { data } = useSWR(`/api/users/${id}`, { fallbackData })
    return data as User
}
