import { answersMatch } from '../utils/answersMatch'

export enum QuestionKind {
    Choice = 'choice',
    Written = 'written',
}
export enum Outcome {
    Correct = 'correct',
    Incorrect = 'incorrect',
    Pending = 'pending',
}
export interface Question {
    id: string
    prompt: string
    kind: QuestionKind
    choices: string[]
    expected: string
    explanation: string
}
export interface Submission {
    question: Question
    answer: string
    outcome: Outcome
    feedback: string
}
export const questions: Question[] = [
    {
        id: 'clarify',
        prompt: 'A customer reports a problem, but the details are unclear. What should you do first?',
        kind: QuestionKind.Choice,
        choices: [
            'Ask a focused follow-up question',
            'Promise an immediate fix',
            'Close the request',
        ],
        expected: 'Ask a focused follow-up question',
        explanation:
            'Clarify what happened and what the customer expected before choosing a solution.',
    },
    {
        id: 'document',
        prompt: 'Which note is most useful to the next person handling a request?',
        kind: QuestionKind.Choice,
        choices: [
            'Customer called again',
            'Issue unresolved',
            'Confirmed the error, recorded the steps, and agreed to follow up tomorrow',
        ],
        expected:
            'Confirmed the error, recorded the steps, and agreed to follow up tomorrow',
        explanation:
            'A useful handoff includes evidence, actions already taken, and the next commitment.',
    },
    {
        id: 'handoff',
        prompt: 'Write a short handoff for a teammate when you need help resolving a customer’s issue.',
        kind: QuestionKind.Written,
        choices: [],
        expected: '',
        explanation:
            'Include the customer’s goal, what you checked, and the next step. A reviewer will assess this response.',
    },
]
export function submitAnswer({
    question,
    answer,
}: {
    question: Question
    answer: string
}): Submission {
    if (!answer.trim()) throw new Error('An answer is required')
    const outcome =
        question.kind === QuestionKind.Written
            ? Outcome.Pending
            : answersMatch({ answer, expected: question.expected })
            ? Outcome.Correct
            : Outcome.Incorrect
    return { question, answer: answer.trim(), outcome, feedback: '' }
}
export function summarize(submissions: Submission[]) {
    const correct = submissions.filter(
        item => item.outcome === Outcome.Correct
    ).length
    const incorrect = submissions.filter(
        item => item.outcome === Outcome.Incorrect
    ).length
    const pending = submissions.filter(
        item => item.outcome === Outcome.Pending
    ).length
    return {
        correct,
        incorrect,
        pending,
        accuracy:
            correct + incorrect
                ? Math.round((100 * correct) / (correct + incorrect))
                : null,
    }
}
