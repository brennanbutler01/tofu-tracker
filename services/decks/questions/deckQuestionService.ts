import type { DeckWithQuestions } from '@/pages/decks/[id]'
import type { DeckQuestionAction } from '@/server/deckAuthoring'
import { http } from '@/services/http'
export const deckQuestionService = {
    update: (id: string, data: DeckQuestionAction) =>
        http.request<DeckWithQuestions>({
            method: 'PUT',
            url: `/decks/questions/${id}`,
            data,
        }),
    remove: (id: string, questionId: string) =>
        http.delete<DeckWithQuestions>(`/decks/questions/${id}/${questionId}`),
}
