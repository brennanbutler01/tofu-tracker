import { useSWRConfig } from 'swr'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useUnfinishedGamesSWR } from '@/services/games/unfinishedGames/useUnfinishedGamesSWR'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { unfinishedGameService } from '@/services/games/unfinishedGames/unfinishedGameService'

export const UNFINISHED_GAME_URL = '/api/games/unfinished'

export const useUnfinishedGameCRUD = () => {
    const { mutate } = useSWRConfig()
    const { data: session } = useSession()
    const {
        query: { id },
    } = useRouter()
    const unfinishedGames = useUnfinishedGamesSWR()

    const deleteGame = async (id: string) => {
        try {
            await mutate(
                UNFINISHED_GAME_URL,
                unfinishedGameService.deleteGameSession(id).then(res => {
                    messageConfig({
                        model: Models.GAME,
                        status: MessageStatus.SUCCESS,
                        operation: CRUDOperation.DELETE,
                    })
                    console.log('deleted res data', res.data)
                    return unfinishedGames.filter(game => game.id !== id)
                }),
                {
                    rollbackOnError: true,
                    optimisticData: unfinishedGames.filter(
                        game => game.id !== id
                    ),
                }
            )
        } catch (err) {
            console.log(`Error deleting Game Session with Questions: ${err}`)
            messageConfig({
                operation: CRUDOperation.DELETE,
                model: Models.GAME,
                status: MessageStatus.ERROR,
            })
        }
    }

    return { deleteGame }
}
