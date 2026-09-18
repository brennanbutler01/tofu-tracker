import { useSWRConfig } from 'swr'
import type { Deck } from '@prisma/client'
import { message } from 'antd'
import { deckService } from './deckService'
import type { IDeckForm } from '@/decks/DeckForm'
import { useRouter } from 'next/router'
export const DECK_URL = '/api/decks'
export const useDeckCRUD = () => {
    const { mutate } = useSWRConfig()
    const { query } = useRouter()
    const refresh = async (id?: string) => {
        await mutate(DECK_URL)
        await mutate('/api/decks/game')
        if (id) await mutate(`${DECK_URL}/questions/${id}`)
    }
    const deleteDeck = async (deck: Deck) => {
        try {
            await deckService.deleteDeck(deck.id)
            await refresh()
            message.success(
                'Deck archived. Existing learning results are preserved.'
            )
            return true
        } catch {
            message.error('Could not archive this deck. Please try again.')
            return false
        }
    }
    const createDeck = async (values: IDeckForm) => {
        try {
            const result = await deckService.createDeck({
                title: values.title,
                tags: values.tags ?? [],
            })
            await refresh()
            return result.data.id
        } catch {
            message.error(
                'Could not create this deck. Your entries are still here.'
            )
            return undefined
        }
    }
    const saveDeck = async (id: string, values: IDeckForm) => {
        try {
            const result = await deckService.updateDeck(id, {
                title: values.title,
                tags: values.tags ?? [],
            })
            await mutate(`${DECK_URL}/questions/${id}`, result.data, false)
            await refresh()
            message.success('Deck saved.')
            return true
        } catch {
            message.error(
                'Could not save this deck. Your entries are still here.'
            )
            return false
        }
    }
    return {
        deleteDeck,
        createDeck,
        updateDeck: (deck: Deck) =>
            saveDeck(deck.id, { title: deck.title, tags: deck.tags }),
        updateDeckWithQuestions: (values: IDeckForm) =>
            typeof query.id === 'string'
                ? saveDeck(query.id, values)
                : Promise.resolve(false),
    }
}
