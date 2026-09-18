import useSWR from 'swr'
import { GAME_URL } from '@/services/games/useGameCRUD'
import { GameWithFullOptions } from '@/pages/api/games/[id]'

export const useGamesSWR = (id: string, fallbackData?: GameWithFullOptions) => {
    const { data } = useSWR(`${GAME_URL}${id ? `/${id}` : ''}`, {
        fallbackData,
    })
    return data as GameWithFullOptions
}
