import { randomBytes, randomUUID } from 'node:crypto'
import { QuestionType, type Prisma } from '@prisma/client'
import prisma from '@/prisma/prisma'

const visitorLifetimeMs = 60 * 60 * 1000
const maxVisitors = 100
export async function seedVisitorCurriculum(
    tx: Prisma.TransactionClient,
    userId: string
) {
    const deck = await tx.deck.create({
        data: {
            userId,
            title: 'Reliable services',
            tags: ['Engineering', 'Demo'],
        },
    })
    const questions = []
    for (const input of [
        {
            question:
                'An operation should be safe to retry when a network response is lost.',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'true',
            explanation:
                'An idempotent operation avoids repeating side effects when a request is retried.',
            options: ['true', 'false'],
        },
        {
            question: 'Which measurement shows a slow tail of requests?',
            type: QuestionType.MULTIPLE_CHOICE,
            correctAnswer: '95th percentile latency',
            explanation:
                'Percentile latency shows the slower part of a request distribution.',
            options: [
                'Average response size',
                '95th percentile latency',
                'Total registered users',
            ],
        },
        {
            question:
                'Describe how you would investigate a sudden increase in failed requests.',
            type: QuestionType.FREE_RESPONSE,
            correctAnswer:
                'Check recent changes, compare error and latency trends, identify affected dependencies, mitigate, and verify recovery.',
            explanation: 'Written answers are reviewed by a person.',
            options: [],
        },
    ]) {
        const { options, ...fields } = input
        questions.push(
            await tx.question.create({
                data: {
                    ...fields,
                    deckId: deck.id,
                    options: { create: options.map(answer => ({ answer })) },
                },
            })
        )
    }
    const course = await tx.course.create({
        data: {
            ownerId: userId,
            title: 'Production engineering basics',
            description:
                'Practice retries, latency and incident investigation with fictional examples.',
            percentToPass: 60,
            preReqs: [],
            decks: { connect: { id: deck.id } },
        },
    })
    const activity = await tx.activity.create({
        data: {
            ownerId: userId,
            title: 'A quick reliability check',
            description:
                'A short assessment with its own copy of the question.',
            percentToPass: 100,
            displayOnMain: true,
            questionOrder: [],
        },
    })
    const copied = await tx.question.create({
        data: {
            activityId: activity.id,
            question: questions[0].question,
            type: questions[0].type,
            correctAnswer: questions[0].correctAnswer,
            explanation: questions[0].explanation,
            options: { create: [{ answer: 'true' }, { answer: 'false' }] },
        },
    })
    await tx.activity.update({
        where: { id: activity.id },
        data: { questionOrder: [copied.id] },
    })
    await tx.learningTrack.create({
        data: {
            ownerId: userId,
            title: 'Build and operate',
            description:
                'Explore the sample course, then create your own curriculum.',
            courses: { connect: { id: course.id } },
            courseOrder: { create: { courseId: course.id, index: 0 } },
        },
    })
    // A completed synthetic written answer makes the reviewer workflow available immediately.
    const written = questions[2]
    const answer = await tx.answerOption.create({
        data: {
            ownerId: userId,
            answer: 'I would compare errors with recent releases, inspect dependencies, and verify a rollback or other mitigation.',
        },
    })
    await tx.gameSession.create({
        data: {
            userId,
            title: 'Sample review',
            type: 'FREE',
            isComplete: true,
            completedAt: new Date(),
            numberAnswered: 1,
            questionOrder: [written.id],
            questions: { connect: { id: written.id } },
            answerHistory: {
                create: {
                    playerId: userId,
                    questionId: written.id,
                    answerOptionId: answer.id,
                    isCorrect: 'NEEDS_GRADED',
                },
            },
        },
    })
}
export async function createVisitorWorkspace() {
    return prisma.$transaction(
        async tx => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(51975197)`
            await tx.user.deleteMany({
                where: { demoVisit: { expiresAt: { lte: new Date() } } },
            })
            if ((await tx.demoVisit.count()) >= maxVisitors) return null
            const userId = 'visitor-' + randomUUID()
            const token = randomBytes(32).toString('hex')
            const expiresAt = new Date(Date.now() + visitorLifetimeMs)
            await tx.user.create({
                data: {
                    id: userId,
                    name: 'Demo engineer',
                    email: userId + '@example.invalid',
                    role: 'ADMIN',
                    sessions: {
                        create: { sessionToken: token, expires: expiresAt },
                    },
                    demoVisit: { create: { expiresAt } },
                },
            })
            await seedVisitorCurriculum(tx, userId)
            return { userId, token, expiresAt }
        },
        { timeout: 15000 }
    )
}
export async function resetVisitorWorkspace(userId: string) {
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`
        return tx.user.deleteMany({
            where: { id: userId, demoVisit: { isNot: null } },
        })
    })
}
