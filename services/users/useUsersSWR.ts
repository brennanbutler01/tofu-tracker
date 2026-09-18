import useSWR from 'swr'
import { Question, User } from '@prisma/client'

//TODO- type this and make it more flexible.
//this hook is used to have a custom useSWR hook where we get the data for our questions.
export const useUsersSWR = (fallbackData?: User[]) => {
    const { data } = useSWR(`/api/users`, { fallbackData })

    return data as Array<User>
}
