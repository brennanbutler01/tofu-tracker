import { useSWRConfig } from 'swr'
import { Deck, Prisma } from '@prisma/client'
import { deckService } from '@/services/decks/deckService'
import { useSession } from 'next-auth/react'
import {
    CRUDOperation,
    messageConfig,
    MessageStatus,
    Models,
} from '@/utils/message.utils'
import { IDeckForm } from '@/decks/DeckForm'
import { useDecksSWR } from '@/services/decks/useDecksSWR'
import deepEqual from 'fast-deep-equal'
import { useDeckQuestionsSWR } from '@/services/decks/questions/useDeckQuestionsSWR'
import { useRouter } from 'next/router'
import cuid from 'cuid'

export const DECK_URL = '/api/decks'

//this function parses a Prisma Deck input and returns a Deck object suitable for our local storage.
const mutateNewDeck = (newDeck: Prisma.DeckCreateInput) => {
    const { user, ...rest } = newDeck
    return { ...rest, userId: user?.connect?.id } as Deck
}

//contains CRUD Operations to update our Deck local state + DB together.
export const useDeckCRUD = () => {
    const decks = useDecksSWR()
    const { mutate } = useSWRConfig()
    const { data: session } = useSession()
    // const deckWithQuestions = useDeckQuestionCRUD();
    const { query } = useRouter()
    const deckWithQuestions = useDeckQuestionsSWR((query?.id as string) || '')

    //this function is used to delete the passed in Deck and then mutate the local state if successful.
    const deleteDeck = async (deck: Deck) => {
        try {
            await mutate(
                DECK_URL,
                deckService.deleteDeck({ id: deck.id }).then(res => {
                    //show the user that the item was deleted with a toast notification
                    messageConfig({
                        model: Models.DECK,
                        operation: CRUDOperation.DELETE,
                        status: MessageStatus.SUCCESS,
                    })
                    //return our mutated data to update the cache.
                    return decks?.filter(d => d.id !== res.data.id)
                }),
                {
                    //we will pass in our optimistic update to try to update the local state immediately.
                    optimisticData:
                        decks?.filter(d => d.id !== deck.id) ?? [],
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            console.log('Error in deleting record: ', err)
            messageConfig({
                model: Models.DECK,
                operation: CRUDOperation.DELETE,
                status: MessageStatus.ERROR,
            })
        }
    }

    //this function is used to create a new Deck from the passed in values and mutate the local state
    const createDeck = async (values: IDeckForm) => {
        // console.log("title", values.title, "tags", values.tags);
        if (session?.user?.userId) {
            //this is the new deck that we would like to build
            const newDeck: Prisma.DeckCreateInput = {
                id: cuid(),
                title: values.title || 'title',
                user: {
                    connect: {
                        id: session?.user?.userId,
                    },
                },
                ...(values.tags && {
                    tags: values?.tags,
                }),
            }

            try {
                await mutate(
                    DECK_URL,
                    await deckService.createDeck(newDeck).then(res => {
                        //let the user know that they have created a new deck
                        messageConfig({
                            model: Models.DECK,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.CREATE,
                        })
                        //return our updated local state - we added our new deck at the end of the array of decks
                        return [...decks, res.data]
                    }),
                    {
                        optimisticData: [
                            ...(decks ? [...decks] : []),
                            mutateNewDeck(newDeck),
                        ],
                        rollbackOnError: true,
                    }
                )
                return newDeck.id
            } catch (err) {
                console.log(`Error trying to create a new Deck: ${err}`)
                messageConfig({
                    model: Models.DECK,
                    status: MessageStatus.ERROR,
                    operation: CRUDOperation.CREATE,
                })
            }
        }
    }

    //this function is used to update the passed in Deck and mutate the local state.
    const updateDeck = async (deck: Deck) => {
        try {
            await mutate(
                DECK_URL,
                deckService
                    .updateDeck({ id: deck.id, title: deck.title })
                    .then(res => {
                        messageConfig({
                            model: Models.DECK,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return [
                            ...decks.map(d =>
                                d.id === deck.id ? res.data : d
                            ),
                        ]
                    }),
                {
                    optimisticData: [
                        ...decks.filter(d => d.id !== deck.id),
                        { ...deck, title: deck.title },
                    ],
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            console.log(`Error updating deck: ${err}`)
            messageConfig({
                model: Models.DECK,
                status: MessageStatus.ERROR,
                operation: CRUDOperation.UPDATE,
            })
        }
    }

    const updateDeckWithQuestions = async (values: IDeckForm) => {
        //lets go through each of the keys in our values and make sure that the item really changed.
        const changedKeys: Partial<IDeckForm> = {}
        if (values.title !== deckWithQuestions.title) {
            changedKeys.title = values.title
        }

        if (!deepEqual(values.tags, deckWithQuestions.tags)) {
            changedKeys.tags = values.tags
        }

        try {
            await mutate(
                `${DECK_URL}/questions/${deckWithQuestions.id}`,
                deckService
                    .updateDeckWithQuestions({
                        ...changedKeys,
                        id: deckWithQuestions.id,
                    })
                    .then(res => {
                        messageConfig({
                            model: Models.DECK_WITH_QUESTIONS,
                            status: MessageStatus.SUCCESS,
                            operation: CRUDOperation.UPDATE,
                        })
                        return res.data
                    }),
                {
                    optimisticData: { ...deckWithQuestions, ...changedKeys },
                    rollbackOnError: true,
                }
            )
        } catch (err) {
            console.log(`Error updating Deck With Questions.... ${err}`)
        }
    }

    return { deleteDeck, createDeck, updateDeck, updateDeckWithQuestions }
}
