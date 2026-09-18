import {
    questions,
    submitAnswer,
    summarize,
    Outcome,
    QuestionKind,
} from '../portfolio/course'
import { answersMatch } from '../utils/answersMatch'

test('automatic grading matches the original case-insensitive trimmed answer rule', () => {
    expect(answersMatch({ answer: ' YES ', expected: 'yes' })).toBe(true)
    expect(answersMatch({ answer: 'no', expected: 'yes' })).toBe(false)
    expect(
        submitAnswer({ question: questions[0], answer: questions[0].expected })
            .outcome
    ).toBe(Outcome.Correct)
    expect(
        submitAnswer({ question: questions[0], answer: 'wrong' }).outcome
    ).toBe(Outcome.Incorrect)
})
test('written responses await review and do not count as incorrect', () => {
    const written = questions.find(item => item.kind === QuestionKind.Written)
    if (!written) throw new Error('Missing written question')
    const submission = submitAnswer({
        question: written,
        answer: 'A useful handoff',
    })
    expect(summarize([submission])).toEqual({
        correct: 0,
        incorrect: 0,
        pending: 1,
        accuracy: null,
    })
    expect(
        summarize([{ ...submission, outcome: Outcome.Correct }]).accuracy
    ).toBe(100)
})
test('empty answers cannot be submitted', () => {
    expect(() =>
        submitAnswer({ question: questions[0], answer: '  ' })
    ).toThrow('An answer is required')
})
