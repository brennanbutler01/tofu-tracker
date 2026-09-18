import { apiHandler } from '@/server/apiHandler'
import { requireReviewer } from '@/server/gradingSessions'
import {
    getCourses,
    createCourse,
    createCourseSchema,
    coursesWithDecks,
} from '@/server/contentAuthoring'
import type { Prisma } from '@prisma/client'
export type CourseWithDecks = Prisma.CourseGetPayload<typeof coursesWithDecks>
export { getCourses, coursesWithDecks } from '@/server/contentAuthoring'
export default apiHandler(['GET', 'POST'], async (req, res, viewer) => {
    if (req.method === 'GET')
        res.status(200).json(await getCourses(viewer.userId))
    else {
        requireReviewer(viewer)
        res.status(201).json(
            await createCourse(
                viewer.userId,
                createCourseSchema.parse(req.body)
            )
        )
    }
})
