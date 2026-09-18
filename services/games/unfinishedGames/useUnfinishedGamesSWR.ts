import useSWR from 'swr'
import { UNFINISHED_GAME_URL } from '@/services/games/unfinishedGames/useUnfinishedGameCRUD'
import { GameWithOptions } from '@/pages/api/games/unfinished'

export const useUnfinishedGamesSWR = (
    fallbackData?: Array<GameWithOptions>
) => {
    const { data } = useSWR(UNFINISHED_GAME_URL, { fallbackData })
    return data as Array<GameWithOptions>
}
