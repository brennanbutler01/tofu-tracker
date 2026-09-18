import { http } from '@/services/http'
import { GameWithOptions } from '@/pages/api/games/unfinished'

class UnfinishedGameService {
    private UNFINISHED_GAME_ENDPOINT = '/games/unfinished'

    deleteGameSession = async (id: string) =>
        await http.delete<GameWithOptions>(
            `${this.UNFINISHED_GAME_ENDPOINT}/${id}`
        )
}

export const unfinishedGameService = new UnfinishedGameService()
