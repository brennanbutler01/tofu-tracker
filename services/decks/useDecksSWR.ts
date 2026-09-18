import useSWR from 'swr'
import { DECK_URL } from '@/services/decks/useDeckCRUD'
import { Prisma } from '@prisma/client'
import { DeckWithQuestionCount } from '@/pages/api/decks'

//this hook is used to have a custom useSWR hook where we get the data for our decks.
export const useDecksSWR = (
    fallbackData?: Prisma.Enumerable<DeckWithQuestionCount>
) => {
    const { data } = useSWR(DECK_URL, { fallbackData })

    return data as Array<DeckWithQuestionCount>
}
