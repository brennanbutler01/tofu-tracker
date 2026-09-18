import { http } from '../http'
import type { GameWithFullOptions } from 'server/gameShapes'
import type { GameAction } from 'server/gameSessions'
export const gameService = {
    createGameSession: (game: {
        id?: string
        title: string
        questionIds: string[]
    }) =>
        http.request<GameWithFullOptions>({
            method: 'POST',
            url: '/games',
            data: game,
        }),
    updateGameSession: (id: string, action: GameAction) =>
        http.request<GameWithFullOptions>({
            method: 'PUT',
            url: `/games/${id}`,
            data: action,
        }),
}
