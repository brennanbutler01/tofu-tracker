import useSWR from 'swr'
import { DeckWithQuestions } from '@/pages/decks/[id]'

export const useDeckQuestionsSWR = (deckId: string, fallbackData?: any) => {
    const { data } = useSWR(`/api/decks/questions/${deckId}`, { fallbackData })
    return data as DeckWithQuestions
}
