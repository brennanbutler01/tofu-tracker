import { Prisma } from '@prisma/client'
import { http } from '../http'

class CourseService {
    private COURSE_ENDPOINT = '/courses'
    private singularCourses = (
        courses: Prisma.CourseWhereInput | Prisma.CourseUpdateInput
    ) => `${this.COURSE_ENDPOINT}/${courses.id}`

    createCourse = async (course: Prisma.CourseCreateInput) =>
        await http.post<Prisma.CourseCreateInput>(this.COURSE_ENDPOINT, course)
    updateCourse = async (course: Prisma.CourseUpdateInput) =>
        await http.put(this.singularCourses(course), course)
    // updateDeckWithQuestions = async (deck: Prisma.DeckUpdateInput) =>
    //     await http.put(`/decks/questions/${deck.id}`, deck);
    deleteCourse = async (course: Prisma.CourseWhereInput) =>
        await http.delete<Prisma.CourseWhereInput>(this.singularCourses(course))
}

export const courseService = new CourseService()
