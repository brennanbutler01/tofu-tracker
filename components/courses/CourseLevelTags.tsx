import { StyledTag } from '@/decks/DeckTags'
import { Course, CourseLevel } from '@prisma/client'
import { useTheme } from 'styled-components'

const tagColors: Record<CourseLevel, string> = {
    [CourseLevel.ADVANCED]: '#8a0303',
    [CourseLevel.EXPERT]: '#320671',
    [CourseLevel.BEGINNER]: '#004daa',
    [CourseLevel.INTERMEDIATE]: '#ed8a19',
    [CourseLevel.ALL]: '#4cc0a8',
}

const CourseLevelTags = ({ level }: { level: CourseLevel }) => {
    return <StyledTag color={tagColors[level]}>{level}</StyledTag>
}
export default CourseLevelTags
