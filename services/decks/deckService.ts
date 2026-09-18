import { Prisma } from '@prisma/client'
import { http } from '../http'

class DeckService {
    private DECK_ENDPOINT = '/decks'
    private singularDeck = (
        deck: Prisma.DeckWhereInput | Prisma.DeckUpdateInput
    ) => `${this.DECK_ENDPOINT}/${deck.id}`

    createDeck = async (deck: Prisma.DeckCreateInput) =>
        await http.post<Prisma.DeckCreateInput>(this.DECK_ENDPOINT, deck)
    updateDeck = async (deck: Prisma.DeckUpdateInput) =>
        await http.put(this.singularDeck(deck), deck)
    updateDeckWithQuestions = async (deck: Prisma.DeckUpdateInput) =>
        await http.put(`/decks/questions/${deck.id}`, deck)
    deleteDeck = async (deck: Prisma.DeckWhereInput) =>
        await http.delete<Prisma.DeckWhereInput>(this.singularDeck(deck))
}

export const deckService = new DeckService()
