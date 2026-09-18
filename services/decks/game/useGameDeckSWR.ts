import useSWR from 'swr'
import { Prisma } from '@prisma/client'
import { DecksWithQuestionOptions } from '@/pages/api/decks/game'

export const GAME_DECK_URL = '/api/decks/game'

//this hook is used to have a custom useSWR hook where we get the data for our decks.
export const useGameDeckSWR = (
    fallbackData?: Prisma.Enumerable<DecksWithQuestionOptions>
) => {
    const { data } = useSWR(GAME_DECK_URL, { fallbackData })

    return data as Array<DecksWithQuestionOptions>
}
