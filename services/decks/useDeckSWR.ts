import useSWR from 'swr'
import { DeckWithQuestions } from '@/pages/decks/[id]'
import { DECK_URL } from '@/services/decks/useDeckCRUD'

//this hook is used to have a custom useSWR hook where we get the data for our decks.
export const useDeckSWR = (id: string, fallbackData?: DeckWithQuestions) => {
    const { data } = useSWR([DECK_URL, id], { fallbackData })

    return data as DeckWithQuestions
}
