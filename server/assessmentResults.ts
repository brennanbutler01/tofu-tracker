import { CorrectStatus, Prisma } from '@prisma/client'

// Call while holding the game row lock so answers and reviews cannot race totals.
export async function refreshAssessmentResults(
    tx: Prisma.TransactionClient,
    id: string
) {
    const game = await tx.gameSession.findUniqueOrThrow({
        where: { id },
        include: { answerHistory: true, questions: true },
    })
    const numberCorrect = game.answerHistory.filter(
        answer => answer.isCorrect === CorrectStatus.TRUE
    ).length
    const pending = game.answerHistory.some(
        answer => answer.isCorrect === CorrectStatus.NEEDS_GRADED
    )
    await tx.gameSession.update({
        where: { id },
        data: {
            numberAnswered: game.answerHistory.length,
            numberCorrect,
        },
    })
    const score = game.questions.length
        ? (numberCorrect / game.questions.length) * 100
        : 0
    const canPass =
        game.isComplete &&
        !pending &&
        game.answerHistory.length === game.questions.length
    const activity = await tx.activitySession.findUnique({
        where: { gameSessionId: id },
        include: { activity: true },
    })
    const course = await tx.courseSession.findUnique({
        where: { gameSessionId: id },
        include: { course: true },
    })
    if (activity)
        await tx.activitySession.update({
            where: { id: activity.id },
            data: {
                isComplete: game.isComplete,
                passed:
                    canPass &&
                    score >=
                        (game.passingThreshold ??
                            activity.activity.percentToPass),
            },
        })
    if (course)
        await tx.courseSession.update({
            where: { id: course.id },
            data: {
                isComplete: game.isComplete,
                passed:
                    canPass &&
                    score >=
                        (game.passingThreshold ?? course.course.percentToPass),
            },
        })
}
