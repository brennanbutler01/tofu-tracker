import { z } from 'zod'
const count = z.number().int().nonnegative()
export const questionMetricSchema = z.object({
    id: z.string(),
    question: z.string(),
    correct: count,
    incorrect: count,
    pending: count,
})
export const userQuestionMetricSchema = z.object({
    userId: z.string(),
    email: z.string(),
    correct: count,
    incorrect: count,
    pending: count,
})
export const courseMetricSchema = z.object({
    id: z.string(),
    title: z.string(),
    passed: count,
    failed: count,
    pending: count,
    inProgress: count,
})
export type QuestionMetric = z.infer<typeof questionMetricSchema>
export type UserQuestionMetric = z.infer<typeof userQuestionMetricSchema>
export type CourseMetric = z.infer<typeof courseMetricSchema>
