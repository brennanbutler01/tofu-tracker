import { withVisitorGuard } from '@/server/visitorAccess'
import prisma from '@/prisma/prisma'
import { createAnswerMetricsHandler } from '../../../../server/answerMetricsHandler'
import type { UserAnswersByDay } from '../../../../server/answerMetricsHandler'
import { getViewer } from '../../../../server/viewer'

export type IUserAnswersByDay = UserAnswersByDay

export default withVisitorGuard(
    createAnswerMetricsHandler({
        getViewer,
        getAnswers: userId => prisma.$queryRaw<UserAnswersByDay[]>`
        SELECT COUNT(*)::INTEGER as "completed",
        to_char((created at time zone 'utc' at time zone 'America/Los_Angeles')::date, 'MM/DD/YYYY') as "date", "playerId"
        FROM "GameAnswer" WHERE "playerId" = ${userId}
        GROUP BY (created at time zone 'utc' at time zone 'America/Los_Angeles')::date, "playerId"
        ORDER BY (created at time zone 'utc' at time zone 'America/Los_Angeles')::date`,
        reportError: console.error,
    })
)
