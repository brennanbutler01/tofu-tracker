import useSWR from 'swr'
import { GAME_URL } from '@/services/games/useGameCRUD'
import { GameWithFullOptions } from '@/pages/api/games/[id]'

export const useGamesSWR = (
    id: string,
    fallbackData?: GameWithFullOptions,
    enabled = true
) => {
    const { data } = useSWR(
        enabled ? `${GAME_URL}${id ? `/${id}` : ''}` : null,
        {
            fallbackData,
        }
    )
    return data as GameWithFullOptions
}
