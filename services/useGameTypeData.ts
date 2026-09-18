import { QuizProps } from '@/components/game/Quiz'
import { useRouter } from 'next/router'
import { useSingleActivitySessionSWR } from './activitySession/useSingleActivitySessionSWR'
import { useSingularCourseSessionSWR } from './courseSession/useSingularCourseSessionSWR'
import { useGamesSWR } from './games/useGamesSWR'

export const useGameTypeData = ({ type }: QuizProps) => {
    const {
        query: { id },
    } = useRouter()

    const game = useGamesSWR(id as string)
    const courseSession = useSingularCourseSessionSWR({ id: id as string })
    const { data: activitySession } = useSingleActivitySessionSWR({})

    return type === 'free'
        ? game
        : type === 'course'
        ? courseSession?.gameSession
        : activitySession?.gameSession
}
