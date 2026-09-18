import type { Deck } from '@prisma/client'
import type { DeckWithQuestions } from '@/pages/decks/[id]'
import type { IDeckForm } from '@/decks/DeckForm'
import { http } from '../http'
export const deckService = {
    createDeck: (data: IDeckForm) =>
        http.request<DeckWithQuestions>({
            method: 'POST',
            url: '/decks',
            data,
        }),
    updateDeck: (id: string, data: Partial<IDeckForm>) =>
        http.request<DeckWithQuestions>({
            method: 'PUT',
            url: `/decks/${id}`,
            data,
        }),
    deleteDeck: (id: string) => http.delete<Deck>(`/decks/${id}`),
}
