import { useState } from 'react'
import {
    questions,
    QuestionKind,
    Outcome,
    submitAnswer,
    summarize,
} from './course'
import type { Submission } from './course'

enum View {
    Learn = 'learn',
    Review = 'review',
    Results = 'results',
}
export default function Demo() {
    const [view, setView] = useState(View.Learn)
    const [started, setStarted] = useState(false)
    const [index, setIndex] = useState(0)
    const [answer, setAnswer] = useState('')
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [feedback, setFeedback] = useState('')
    const [notice, setNotice] = useState('')
    const question = questions[index]
    const current = submissions[index]
    const complete = submissions.length === questions.length
    const summary = summarize(submissions)
    const pending = submissions.find(item => item.outcome === Outcome.Pending)
    function reset() {
        setView(View.Learn)
        setStarted(false)
        setIndex(0)
        setAnswer('')
        setSubmissions([])
        setFeedback('')
        setNotice('Demo reset. You have a fresh course to try.')
    }
    function grade(outcome: Outcome.Correct | Outcome.Incorrect) {
        if (!pending || !feedback.trim()) return
        setSubmissions(items =>
            items.map(item =>
                item.question.id === pending.question.id
                    ? { ...item, outcome, feedback: feedback.trim() }
                    : item
            )
        )
        setFeedback('')
        setNotice('Review saved. The learner’s results are updated.')
    }
    return (
        <div className='app'>
            <a className='skip' href='#main'>
                Skip to content
            </a>
            <header>
                <a className='brand' href='/' aria-label='TofuTracker home'>
                    <span className='brand-icon' aria-hidden='true'>
                        豆
                    </span>{' '}
                    tofu<span>tracker</span>
                </a>
                <span className='demo-badge'>Interactive portfolio</span>
                <button className='quiet' onClick={reset}>
                    Reset demo ↻
                </button>
            </header>
            <div className='shell'>
                <aside>
                    <p className='eyebrow'>Learning workspace</p>
                    <nav aria-label='Workspace'>
                        <button
                            aria-current={
                                view === View.Learn ? 'page' : undefined
                            }
                            onClick={() => setView(View.Learn)}
                        >
                            01 <span>Learn & practice</span>
                        </button>
                        <button
                            aria-current={
                                view === View.Review ? 'page' : undefined
                            }
                            onClick={() => setView(View.Review)}
                        >
                            02 <span>Review responses</span>
                            <b>{summary.pending}</b>
                        </button>
                        <button
                            aria-current={
                                view === View.Results ? 'page' : undefined
                            }
                            onClick={() => setView(View.Results)}
                        >
                            03 <span>Your results</span>
                        </button>
                    </nav>
                    <div className='aside-note'>
                        <span className='dot' /> A little practice. Real
                        progress.
                        <p>
                            Try both sides of a learning workflow, from your
                            first answer to a reviewer’s feedback.
                        </p>
                    </div>
                </aside>
                <main id='main'>
                    <div className='sample-note'>
                        Sample workspace · No signup · Changes reset on refresh
                    </div>
                    <p role='status' className='notice'>
                        {notice}
                    </p>
                    {view === View.Learn && (
                        <>
                            <div className='page-heading'>
                                <p className='eyebrow'>Make room to grow</p>
                                <h1>
                                    Small lessons.
                                    <br />
                                    Lasting confidence.
                                </h1>
                                <p>
                                    Practice the everyday decisions that make a
                                    team better.
                                </p>
                            </div>
                            {!started ? (
                                <section className='course-card'>
                                    <div>
                                        <span className='pill'>
                                            Team essentials
                                        </span>
                                        <h2>Better customer handoffs</h2>
                                        <p>
                                            Ask the right questions, leave
                                            useful notes, and help the next
                                            person pick up where you left off.
                                        </p>
                                        <div className='course-meta'>
                                            <span>3 questions</span>
                                            <span>About 2 minutes</span>
                                            <span>Written feedback</span>
                                        </div>
                                        <button
                                            className='primary'
                                            onClick={() => {
                                                setStarted(true)
                                                setNotice('')
                                            }}
                                        >
                                            Start course{' '}
                                            <span aria-hidden='true'>→</span>
                                        </button>
                                    </div>
                                    <div
                                        className='course-art'
                                        aria-hidden='true'
                                    >
                                        <span className='paper'>
                                            A little
                                            <br />
                                            <strong>clarity</strong>
                                            <br />
                                            goes a long way.<i>✳</i>
                                        </span>
                                    </div>
                                </section>
                            ) : (
                                <section className='question-card'>
                                    <div className='question-top'>
                                        <span className='eyebrow'>
                                            Better customer handoffs
                                        </span>
                                        <span>
                                            Question {index + 1} of{' '}
                                            {questions.length}
                                        </span>
                                    </div>
                                    <progress
                                        aria-label='Course progress'
                                        value={submissions.length}
                                        max={questions.length}
                                    />
                                    <h2>{question.prompt}</h2>
                                    <form
                                        onSubmit={event => {
                                            event.preventDefault()
                                            if (!current && answer.trim())
                                                setSubmissions(items => [
                                                    ...items,
                                                    submitAnswer({
                                                        question,
                                                        answer,
                                                    }),
                                                ])
                                        }}
                                    >
                                        {question.kind ===
                                        QuestionKind.Choice ? (
                                            <fieldset
                                                disabled={Boolean(current)}
                                            >
                                                <legend>
                                                    Choose one answer
                                                </legend>
                                                {question.choices.map(
                                                    choice => (
                                                        <label
                                                            className='answer-option'
                                                            key={choice}
                                                        >
                                                            <input
                                                                type='radio'
                                                                name='answer'
                                                                value={choice}
                                                                checked={
                                                                    answer ===
                                                                    choice
                                                                }
                                                                onChange={() =>
                                                                    setAnswer(
                                                                        choice
                                                                    )
                                                                }
                                                            />
                                                            {choice}
                                                        </label>
                                                    )
                                                )}
                                            </fieldset>
                                        ) : (
                                            <label className='written-label'>
                                                Your handoff
                                                <textarea
                                                    maxLength={2000}
                                                    rows={5}
                                                    value={answer}
                                                    disabled={Boolean(current)}
                                                    onChange={event =>
                                                        setAnswer(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder='Here’s what the customer needs, what I checked, and the next step…'
                                                />
                                            </label>
                                        )}
                                        {!current && (
                                            <button
                                                className='primary'
                                                disabled={!answer.trim()}
                                                type='submit'
                                            >
                                                Submit answer
                                            </button>
                                        )}
                                    </form>
                                    {current && (
                                        <div
                                            className='answer-feedback'
                                            role='status'
                                        >
                                            <strong>
                                                {current.outcome ===
                                                Outcome.Pending
                                                    ? 'Ready for a reviewer'
                                                    : current.outcome ===
                                                      Outcome.Correct
                                                    ? 'That’s right.'
                                                    : 'A chance to learn.'}
                                            </strong>
                                            <p>{question.explanation}</p>
                                        </div>
                                    )}
                                    {current &&
                                        (index < questions.length - 1 ? (
                                            <button
                                                className='primary'
                                                onClick={() => {
                                                    setIndex(index + 1)
                                                    setAnswer('')
                                                }}
                                            >
                                                Next question →
                                            </button>
                                        ) : (
                                            <button
                                                className='primary'
                                                onClick={() =>
                                                    setView(View.Results)
                                                }
                                            >
                                                See your results →
                                            </button>
                                        ))}
                                </section>
                            )}
                            <div className='steps'>
                                <article>
                                    <span>01 / Practice</span>
                                    <h3>Learn by doing</h3>
                                    <p>
                                        Short scenarios turn a concept into a
                                        decision.
                                    </p>
                                </article>
                                <article>
                                    <span>02 / Reflect</span>
                                    <h3>Know the why</h3>
                                    <p>
                                        Immediate explanations make every answer
                                        useful.
                                    </p>
                                </article>
                                <article>
                                    <span>03 / Improve</span>
                                    <h3>Keep the conversation going</h3>
                                    <p>
                                        Written answers get feedback from a
                                        reviewer.
                                    </p>
                                </article>
                            </div>
                        </>
                    )}
                    {view === View.Review && (
                        <>
                            <div className='page-heading'>
                                <p className='eyebrow'>Reviewer view</p>
                                <h1>
                                    Feedback that
                                    <br />
                                    moves learning forward.
                                </h1>
                                <p>
                                    Review a written response and leave a
                                    specific next step.
                                </p>
                            </div>
                            {pending ? (
                                <section className='question-card'>
                                    <span className='pill'>
                                        Awaiting review · Sample learner
                                    </span>
                                    <h2>{pending.question.prompt}</h2>
                                    <blockquote>{pending.answer}</blockquote>
                                    <label className='written-label'>
                                        Your feedback
                                        <textarea
                                            rows={4}
                                            maxLength={2000}
                                            value={feedback}
                                            onChange={event =>
                                                setFeedback(event.target.value)
                                            }
                                            placeholder='What worked well? What could be more specific?'
                                        />
                                    </label>
                                    <div className='actions'>
                                        <button
                                            className='primary'
                                            disabled={!feedback.trim()}
                                            onClick={() =>
                                                grade(Outcome.Correct)
                                            }
                                        >
                                            Meets expectations
                                        </button>
                                        <button
                                            className='secondary'
                                            disabled={!feedback.trim()}
                                            onClick={() =>
                                                grade(Outcome.Incorrect)
                                            }
                                        >
                                            Needs improvement
                                        </button>
                                    </div>
                                </section>
                            ) : (
                                <section className='empty'>
                                    <span aria-hidden='true'>✓</span>
                                    <h2>
                                        {complete
                                            ? 'All caught up'
                                            : 'No responses to review yet'}
                                    </h2>
                                    <p>
                                        {complete
                                            ? 'Your feedback is now part of the learner’s results.'
                                            : 'Complete the course’s written question to try the reviewer workflow.'}
                                    </p>
                                    <button
                                        className='secondary'
                                        onClick={() =>
                                            setView(
                                                complete
                                                    ? View.Results
                                                    : View.Learn
                                            )
                                        }
                                    >
                                        {complete
                                            ? 'View results'
                                            : 'Go to learning'}
                                    </button>
                                </section>
                            )}
                        </>
                    )}
                    {view === View.Results && (
                        <>
                            <div className='page-heading'>
                                <p className='eyebrow'>
                                    Your learning, in focus
                                </p>
                                <h1>
                                    Progress you
                                    <br />
                                    can build on.
                                </h1>
                                <p>
                                    {complete
                                        ? 'You’ve finished the course. Here’s how it went.'
                                        : 'Your results update as you work through the course.'}
                                </p>
                            </div>
                            <div className='metrics'>
                                <article>
                                    <span>Answered</span>
                                    <strong>
                                        {submissions.length}
                                        <small> / 3</small>
                                    </strong>
                                </article>
                                <article>
                                    <span>Graded accuracy</span>
                                    <strong>
                                        {summary.accuracy === null
                                            ? '—'
                                            : summary.accuracy + '%'}
                                    </strong>
                                </article>
                                <article>
                                    <span>Awaiting review</span>
                                    <strong>{summary.pending}</strong>
                                </article>
                            </div>
                            <p className='muted'>
                                Accuracy includes graded answers only. Written
                                responses count after review.
                            </p>
                            <section className='results'>
                                <h2>Your answers</h2>
                                {submissions.length ? (
                                    submissions.map((item, number) => (
                                        <article key={item.question.id}>
                                            <div className='result-title'>
                                                <span className='eyebrow'>
                                                    Question {number + 1}
                                                </span>
                                                <span
                                                    className={
                                                        'pill ' + item.outcome
                                                    }
                                                >
                                                    {item.outcome ===
                                                    Outcome.Pending
                                                        ? 'Awaiting review'
                                                        : item.outcome ===
                                                          Outcome.Correct
                                                        ? 'Correct'
                                                        : 'Needs improvement'}
                                                </span>
                                            </div>
                                            <h3>{item.question.prompt}</h3>
                                            <p>{item.answer}</p>
                                            {item.feedback && (
                                                <div className='review-feedback'>
                                                    <strong>
                                                        Reviewer feedback
                                                    </strong>
                                                    <p>{item.feedback}</p>
                                                </div>
                                            )}
                                        </article>
                                    ))
                                ) : (
                                    <p>
                                        Start the course to see your answers
                                        here.
                                    </p>
                                )}
                            </section>
                            <button
                                className='primary'
                                onClick={() =>
                                    setView(
                                        summary.pending
                                            ? View.Review
                                            : View.Learn
                                    )
                                }
                            >
                                {summary.pending
                                    ? 'Try the reviewer view →'
                                    : 'Back to learning →'}
                            </button>
                        </>
                    )}
                    <footer>
                        <strong>Built by Brennan Butler</strong>
                        <p>
                            A portfolio demonstration of TofuTracker’s learning
                            and review workflows. All content is fictional; this
                            is not agency policy or a production training
                            system.
                        </p>
                        <a
                            href='https://github.com/brennanbutler01'
                            target='_blank'
                            rel='noreferrer'
                        >
                            GitHub profile ↗
                        </a>
                    </footer>
                </main>
            </div>
        </div>
    )
}
