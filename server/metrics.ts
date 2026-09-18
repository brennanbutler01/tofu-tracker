import prisma from '@/prisma/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { identifier, RequestError } from './apiHandler'
import { visitorEnabled } from './visitorAccess'
import { visitorQuestionScope, visitorOwnerScope } from './visitorScope'
import {
    courseMetricSchema,
    questionMetricSchema,
    userQuestionMetricSchema,
} from '@/utils/metricSchemas'
export const metricIdsSchema = z
    .array(identifier)
    .min(1)
    .max(50)
    .transform(ids => [...new Set(ids)])
export async function getQuestionMetrics(ids: string[], userId: string) {
    if (
        visitorEnabled &&
        (await prisma.question.count({
            where: { id: { in: ids }, AND: [visitorQuestionScope(userId)] },
        })) !== ids.length
    )
        throw new RequestError(404, 'Question not found')
    const rows = await prisma.$queryRaw(Prisma.sql`
        SELECT q.id, q.question,
            COUNT(*) FILTER (WHERE a."isCorrect" = 'TRUE')::int AS correct,
            COUNT(*) FILTER (WHERE a."isCorrect" = 'FALSE')::int AS incorrect,
            COUNT(*) FILTER (WHERE a."isCorrect" = 'NEEDS_GRADED')::int AS pending
        FROM "Question" q LEFT JOIN "GameAnswer" a ON a."questionId" = q.id ${
            visitorEnabled
                ? Prisma.sql`AND a."playerId" = ${userId}`
                : Prisma.empty
        }
        WHERE q.id IN (${Prisma.join(ids)}) GROUP BY q.id ORDER BY q.id`)
    return z.array(questionMetricSchema).parse(rows)
}
export async function getQuestionMetricsByUser(id: string, userId: string) {
    if (
        visitorEnabled &&
        !(await prisma.question.findFirst({
            where: { id, AND: [visitorQuestionScope(userId)] },
        }))
    )
        throw new RequestError(404, 'Question not found')
    const rows = await prisma.$queryRaw(Prisma.sql`
        SELECT u.id AS "userId", COALESCE(u.email, u.name, 'Learner') AS email,
            COUNT(*) FILTER (WHERE a."isCorrect" = 'TRUE')::int AS correct,
            COUNT(*) FILTER (WHERE a."isCorrect" = 'FALSE')::int AS incorrect,
            COUNT(*) FILTER (WHERE a."isCorrect" = 'NEEDS_GRADED')::int AS pending
        FROM "GameAnswer" a JOIN "User" u ON u.id = a."playerId"
        WHERE a."questionId" = ${id} ${
        visitorEnabled ? Prisma.sql`AND a."playerId" = ${userId}` : Prisma.empty
    } GROUP BY u.id ORDER BY u.id LIMIT 100`)
    return z.array(userQuestionMetricSchema).parse(rows)
}
export async function getCourseMetrics(ids: string[], userId: string) {
    if (
        visitorEnabled &&
        (await prisma.course.count({
            where: { id: { in: ids }, ...visitorOwnerScope(userId) },
        })) !== ids.length
    )
        throw new RequestError(404, 'Course not found')
    const rows = await prisma.$queryRaw(Prisma.sql`
        SELECT c.id, c.title,
            COUNT(*) FILTER (WHERE s."isComplete" AND s.passed AND NOT EXISTS
                (SELECT 1 FROM "GameAnswer" a WHERE a."gameSessionId" = s."gameSessionId" AND a."isCorrect" = 'NEEDS_GRADED'))::int AS passed,
            COUNT(*) FILTER (WHERE s."isComplete" AND NOT s.passed AND NOT EXISTS
                (SELECT 1 FROM "GameAnswer" a WHERE a."gameSessionId" = s."gameSessionId" AND a."isCorrect" = 'NEEDS_GRADED'))::int AS failed,
            COUNT(*) FILTER (WHERE s."isComplete" AND EXISTS
                (SELECT 1 FROM "GameAnswer" a WHERE a."gameSessionId" = s."gameSessionId" AND a."isCorrect" = 'NEEDS_GRADED'))::int AS pending,
            COUNT(*) FILTER (WHERE s.id IS NOT NULL AND NOT s."isComplete")::int AS "inProgress"
        FROM "Course" c LEFT JOIN "CourseSession" s ON s."courseId" = c.id ${
            visitorEnabled
                ? Prisma.sql`AND s."userId" = ${userId}`
                : Prisma.empty
        }
        WHERE c.id IN (${Prisma.join(ids)}) GROUP BY c.id ORDER BY c.id`)
    return z.array(courseMetricSchema).parse(rows)
}
