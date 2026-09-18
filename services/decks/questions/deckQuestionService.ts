import { Prisma } from '@prisma/client'
import { http } from '@/services/http'

class DeckQuestionService {
    private DECK_ENDPOINT = '/decks/questions'
    private singularDeck = (
        deck: Prisma.DeckWhereInput | Prisma.DeckUpdateInput,
        question?: string
    ) => `${this.DECK_ENDPOINT}/${deck.id}/${question}`

    private putRequest = async (deck: Prisma.DeckUpdateInput) =>
        await http.put(this.singularDeck(deck), deck)

    createDeckQuestion = async (deck: Prisma.DeckUpdateInput) =>
        await this.putRequest(deck)
    updateDeckQuestion = async (deck: Prisma.DeckUpdateInput) =>
        await this.putRequest(deck)
    deleteDeckQuestion = async (
        deck: Prisma.DeckUpdateInput,
        questionId: string
    ) =>
        await http.delete<Prisma.DeckWhereInput>(
            this.singularDeck(deck, questionId)
        )
}

export const deckQuestionService = new DeckQuestionService()
