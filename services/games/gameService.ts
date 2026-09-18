import { Prisma } from '@prisma/client'
import { http } from '../http'

class GameService {
    private GAME_ENDPOINT = '/games'

    createGameSession = async (game: Prisma.GameSessionCreateInput) =>
        await http.post<Prisma.GameSessionCreateInput>(this.GAME_ENDPOINT, game)
    updateGameSession = async (game: Prisma.GameSessionUpdateInput) =>
        await http.put<Prisma.GameSessionUpdateInput>(
            `${this.GAME_ENDPOINT}/${game.id}`,
            game
        )
}

export const gameService = new GameService()
