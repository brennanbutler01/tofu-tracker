import {
    getCourseMetrics,
    getQuestionMetrics,
    getQuestionMetricsByUser,
} from '@/server/metrics'
import {
    getDeckQuestionCount,
    getDeckQuestions,
    editDeck,
    archiveDeck,
    archiveDeckQuestion,
    updateDeckQuestion,
    deckQuestionActionSchema,
} from '@/server/deckAuthoring'
import {
    getQuestionFeedback,
    updateQuestionFeedback,
} from '@/server/questionFeedback'
import {
    getAnswersToGrade,
    createGradingSession,
} from '@/server/gradingSessions'
import {
    getCourses,
    getCourse,
    getActivity,
    findOneTrack,
    createCourse,
    editCourse,
    archiveCourse,
    createActivity,
    editActivity,
    archiveActivity,
    createTrack,
    editTrack,
    archiveTrack,
} from '@/server/contentAuthoring'
import { createFreeGame } from '@/server/gameSessions'
import {
    createActivitySession,
    createCourseSession,
} from '@/server/learningSessions'
import {
    consumeVisitorRequest,
    findVisitorSession,
    visitorCookieName,
} from '@/server/visitorAccess'
import prisma from '@/prisma/prisma'
import {
    createVisitorWorkspace,
    resetVisitorWorkspace,
} from '@/server/visitorWorkspace'

beforeAll(() => {
    if (
        process.env.DATABASE_URL !==
        'postgresql://demo:local-demo-only@127.0.0.1:5197/tofu_tracker'
    )
        throw new Error('Use only the disposable local database')
})
afterAll(async () => {
    await prisma.$disconnect()
})

test('visitor reset removes all linked data and preserves another workspace', async () => {
    const first = await createVisitorWorkspace()
    const second = await createVisitorWorkspace()
    if (!first || !second) throw new Error('Local visitor capacity exhausted')
    try {
        expect(first.userId).not.toBe(second.userId)
        expect(first.token).not.toBe(second.token)
        const question = await prisma.question.findFirstOrThrow({
            where: { deck: { userId: first.userId } },
        })
        const feedback = await prisma.questionFeedback.create({
            data: {
                questionId: question.id,
                comments: {
                    create: {
                        userId: first.userId,
                        comment: 'Synthetic comment',
                        likes: [],
                        dislikes: [],
                        childrenComments: [],
                    },
                },
                rating: { create: { userId: first.userId, rating: 4 } },
            },
        })
        const resource = await prisma.questionResources.create({
            data: {
                feedbackId: feedback.id,
                userId: first.userId,
                title: 'Synthetic guide',
                description: 'Sample',
                location: 'https://example.com',
                tags: [],
                likes: [],
                dislikes: [],
                comments: {
                    create: {
                        userId: first.userId,
                        comment: 'Synthetic resource comment',
                        likes: [],
                        dislikes: [],
                        childrenComments: [],
                    },
                },
            },
        })
        const answer = await prisma.gameAnswer.findFirstOrThrow({
            where: { playerId: first.userId },
        })
        if (!answer.answerOptionId)
            throw new Error('Missing synthetic written answer')
        const review = await prisma.gradingSession.create({
            data: {
                gradedById: first.userId,
                currentAnswer: answer.id,
                answersToGrade: { connect: { id: answer.id } },
            },
        })
        const critique = await prisma.gradingCritique.create({
            data: {
                gradedById: first.userId,
                userAnswerId: answer.answerOptionId,
                critique: 'Synthetic feedback',
                resources: {
                    create: {
                        title: 'Guide',
                        description: 'Sample',
                        location: 'https://example.com',
                        tags: [],
                    },
                },
            },
        })
        await prisma.gameAnswer.update({
            where: { id: answer.id },
            data: { critiqueId: critique.id },
        })
        await Promise.all([
            resetVisitorWorkspace(first.userId),
            resetVisitorWorkspace(first.userId),
        ])
        expect(
            await prisma.user.findUnique({ where: { id: first.userId } })
        ).toBeNull()
        expect(
            await prisma.question.findUnique({ where: { id: question.id } })
        ).toBeNull()
        expect(
            await prisma.questionResources.findUnique({
                where: { id: resource.id },
            })
        ).toBeNull()
        expect(
            await prisma.gradingSession.findUnique({ where: { id: review.id } })
        ).toBeNull()
        expect(
            await prisma.gradingCritique.findUnique({
                where: { id: critique.id },
            })
        ).toBeNull()
        expect(
            await prisma.answerOption.findUnique({
                where: { id: answer.answerOptionId },
            })
        ).toBeNull()
        expect(
            await prisma.demoVisit.count({ where: { userId: first.userId } })
        ).toBe(0)
        expect(
            await prisma.course.count({ where: { ownerId: first.userId } })
        ).toBe(0)
        expect(
            await prisma.activity.count({ where: { ownerId: first.userId } })
        ).toBe(0)
        expect(
            await prisma.learningTrack.count({
                where: { ownerId: first.userId },
            })
        ).toBe(0)
        expect(
            await prisma.user.findUnique({ where: { id: second.userId } })
        ).not.toBeNull()
        expect(
            await prisma.deck.count({ where: { userId: second.userId } })
        ).toBe(1)
        expect(
            await prisma.course.count({ where: { ownerId: second.userId } })
        ).toBe(1)
    } finally {
        await resetVisitorWorkspace(first.userId)
        await resetVisitorWorkspace(second.userId)
    }
}, 30000)

test('creation cleans expired workspaces and reset refuses ordinary accounts', async () => {
    const expired = await createVisitorWorkspace()
    if (!expired) throw new Error('Local visitor capacity exhausted')
    const ordinary = await prisma.user.create({
        data: { name: 'Non-visitor fixture' },
    })
    let next: Awaited<ReturnType<typeof createVisitorWorkspace>> = null
    try {
        await prisma.demoVisit.update({
            where: { userId: expired.userId },
            data: { expiresAt: new Date(0) },
        })
        next = await createVisitorWorkspace()
        expect(next).not.toBeNull()
        expect(
            await prisma.user.findUnique({ where: { id: expired.userId } })
        ).toBeNull()
        expect((await resetVisitorWorkspace(ordinary.id)).count).toBe(0)
        expect(
            await prisma.user.findUnique({ where: { id: ordinary.id } })
        ).not.toBeNull()
    } finally {
        await resetVisitorWorkspace(expired.userId)
        if (next) await resetVisitorWorkspace(next.userId)
        await prisma.user.delete({ where: { id: ordinary.id } })
    }
}, 30000)

test('visitor request guard enforces expiry, origin and atomic budgets', async () => {
    const visitor = await createVisitorWorkspace()
    if (!visitor) throw new Error('Local visitor capacity exhausted')
    const previousOrigin = process.env.NEXTAUTH_URL
    process.env.NEXTAUTH_URL = 'http://127.0.0.1:5220'
    const req = {
        method: 'POST',
        headers: { origin: 'http://127.0.0.1:5220' },
        cookies: { [visitorCookieName]: visitor.token },
        body: { title: 'Test' },
    }
    try {
        expect(await findVisitorSession(visitor.token)).not.toBeNull()
        expect(
            (
                await consumeVisitorRequest({
                    ...req,
                    headers: { origin: 'https://other.example' },
                })
            )?.status
        ).toBe(403)
        expect(
            (
                await consumeVisitorRequest({
                    ...req,
                    body: { text: 'a'.repeat(17000) },
                })
            )?.status
        ).toBe(413)
        expect(await consumeVisitorRequest(req)).toBeNull()
        await prisma.demoVisit.update({
            where: { userId: visitor.userId },
            data: { requests: 999 },
        })
        const results = await Promise.all([
            consumeVisitorRequest(req),
            consumeVisitorRequest(req),
        ])
        expect(results.filter(value => value === null)).toHaveLength(1)
        expect(results.filter(value => value?.status === 429)).toHaveLength(1)
        await prisma.demoVisit.update({
            where: { userId: visitor.userId },
            data: { requests: 0, writeBytes: 500000 },
        })
        expect((await consumeVisitorRequest(req))?.status).toBe(429)
        await prisma.demoVisit.update({
            where: { userId: visitor.userId },
            data: { expiresAt: new Date(0) },
        })
        expect(await findVisitorSession(visitor.token)).toBeNull()
        expect((await consumeVisitorRequest(req))?.status).toBe(401)
    } finally {
        if (previousOrigin === undefined) delete process.env.NEXTAUTH_URL
        else process.env.NEXTAUTH_URL = previousOrigin
        await resetVisitorWorkspace(visitor.userId)
    }
}, 30000)

test('visitor curriculum rejects cross-workspace reads, edits and nested selections', async () => {
    if (process.env.VISITOR_DEMO !== 'true')
        throw new Error('Run visitor verification with VISITOR_DEMO=true')
    const first = await createVisitorWorkspace()
    const second = await createVisitorWorkspace()
    if (!first || !second) throw new Error('Local visitor capacity exhausted')
    try {
        const own = (await getCourses(first.userId))[0]
        const other = (await getCourses(second.userId))[0]
        const ownActivity = await prisma.activity.findFirstOrThrow({
            where: { ownerId: first.userId },
        })
        const otherActivity = await prisma.activity.findFirstOrThrow({
            where: { ownerId: second.userId },
        })
        const ownTrack = await prisma.learningTrack.findFirstOrThrow({
            where: { ownerId: first.userId },
        })
        const otherTrack = await prisma.learningTrack.findFirstOrThrow({
            where: { ownerId: second.userId },
        })
        const otherQuestion = other.decks[0].questions[0]
        expect(
            (await getCourses(first.userId)).every(
                course => course.ownerId === first.userId
            )
        ).toBe(true)
        expect(await getCourse(other.id, first.userId)).toBeNull()
        expect(await getActivity(otherActivity.id, first.userId)).toBeNull()
        expect(await findOneTrack(otherTrack.id, first.userId)).toBeNull()
        await expect(
            editCourse(other.id, { title: 'Cross workspace' }, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            archiveCourse(other.id, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            editCourse(own.id, { deckIds: [other.decks[0].id] }, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            editCourse(own.id, { preReqs: [other.id] }, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            editActivity(
                otherActivity.id,
                { title: 'Cross workspace' },
                first.userId
            )
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            archiveActivity(otherActivity.id, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            editActivity(
                ownActivity.id,
                { questionIds: [otherQuestion.id] },
                first.userId
            )
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            editTrack(otherTrack.id, { title: 'Cross workspace' }, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            archiveTrack(otherTrack.id, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            editTrack(ownTrack.id, { courseIds: [other.id] }, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            createFreeGame(first.userId, {
                title: 'Cross workspace',
                questionIds: [otherQuestion.id],
            })
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            createCourseSession(other.id, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            createActivitySession(otherActivity.id, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        const course = await createCourse(first.userId, {
            title: 'Visitor course',
            description: 'Synthetic',
            percentToPass: 60,
            preReqs: [],
            deckIds: [own.decks[0].id],
            level: 'ALL',
        })
        const activity = await createActivity(first.userId, {
            title: 'Visitor activity',
            description: 'Synthetic',
            percentToPass: 60,
            displayOnMain: false,
            questionIds: [own.decks[0].questions[0].id],
        })
        const track = await createTrack(first.userId, {
            title: 'Visitor track',
            description: 'Synthetic',
            courseIds: [course.id],
        })
        expect(course.ownerId).toBe(first.userId)
        expect(activity.ownerId).toBe(first.userId)
        expect(track.ownerId).toBe(first.userId)
        expect(
            (await createCourseSession(course.id, first.userId)).userId
        ).toBe(first.userId)
        expect(
            (await createActivitySession(activity.id, first.userId)).userId
        ).toBe(first.userId)
    } finally {
        await resetVisitorWorkspace(first.userId)
        await resetVisitorWorkspace(second.userId)
    }
}, 30000)

test('visitor deck, feedback and reviewer access stays in its workspace', async () => {
    const first = await createVisitorWorkspace()
    const second = await createVisitorWorkspace()
    if (!first || !second) throw new Error('Local visitor capacity exhausted')
    try {
        const mine = (await getDeckQuestionCount(first.userId))[0]
        const theirs = (await getDeckQuestionCount(second.userId))[0]
        const foreignQuestion = theirs.questions[0]
        expect(
            (await getDeckQuestionCount(first.userId)).every(
                deck => deck.userId === first.userId
            )
        ).toBe(true)
        expect(await getDeckQuestions(theirs.id, first.userId)).toBeNull()
        await expect(
            editDeck(theirs.id, { title: 'Foreign deck' }, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            archiveDeck(theirs.id, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            archiveDeckQuestion(theirs.id, foreignQuestion.id, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        const command = deckQuestionActionSchema.parse({
            action: 'create',
            question: {
                question: 'Is this my workspace?',
                type: 'TRUE_FALSE',
                correctAnswer: 'true',
            },
        })
        await expect(
            updateDeckQuestion(theirs.id, command, first.userId)
        ).rejects.toMatchObject({ status: 404 })
        expect(
            (await updateDeckQuestion(mine.id, command, first.userId)).questions
                .length
        ).toBe(4)
        const viewer = { userId: first.userId, role: 'ADMIN' as const }
        await expect(
            getQuestionFeedback(foreignQuestion.id, viewer)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            updateQuestionFeedback(foreignQuestion.id, viewer, {
                action: 'comment',
                comment: 'Cross workspace',
            })
        ).rejects.toMatchObject({ status: 404 })
        expect(
            (
                await updateQuestionFeedback(mine.questions[0].id, viewer, {
                    action: 'comment',
                    comment: 'My workspace',
                })
            ).comments[0].userId
        ).toBe(first.userId)
        const ownQueue = await getAnswersToGrade(first.userId)
        const otherQueue = await getAnswersToGrade(second.userId)
        expect(ownQueue).toHaveLength(1)
        expect(ownQueue[0].playerId).toBe(first.userId)
        await expect(
            createGradingSession(first.userId, [otherQueue[0].id])
        ).rejects.toMatchObject({ status: 409 })
        expect(
            (await createGradingSession(first.userId, [ownQueue[0].id]))
                .gradedById
        ).toBe(first.userId)
        expect(await getAnswersToGrade(first.userId)).toHaveLength(0)
        expect(await getAnswersToGrade(second.userId)).toHaveLength(1)
    } finally {
        await resetVisitorWorkspace(first.userId)
        await resetVisitorWorkspace(second.userId)
    }
}, 30000)

test('visitor reports reject foreign curriculum and show only owned results', async () => {
    const first = await createVisitorWorkspace()
    const second = await createVisitorWorkspace()
    if (!first || !second) throw new Error('Local visitor capacity exhausted')
    try {
        const mine = (await getCourses(first.userId))[0]
        const theirs = (await getCourses(second.userId))[0]
        await expect(
            getCourseMetrics([theirs.id], first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            getQuestionMetrics([theirs.decks[0].questions[0].id], first.userId)
        ).rejects.toMatchObject({ status: 404 })
        await expect(
            getQuestionMetricsByUser(
                theirs.decks[0].questions[0].id,
                first.userId
            )
        ).rejects.toMatchObject({ status: 404 })
        expect(await getCourseMetrics([mine.id], first.userId)).toHaveLength(1)
        const written = mine.decks[0].questions.find(
            question => question.type === 'FREE_RESPONSE'
        )
        if (!written) throw new Error('Missing written fixture')
        expect(
            (await getQuestionMetrics([written.id], first.userId))[0].pending
        ).toBe(1)
        const users = await getQuestionMetricsByUser(written.id, first.userId)
        expect(users).toHaveLength(1)
        expect(users[0].userId).toBe(first.userId)
    } finally {
        await resetVisitorWorkspace(first.userId)
        await resetVisitorWorkspace(second.userId)
    }
}, 30000)
