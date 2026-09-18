import { QuizProps } from '@/components/game/Quiz'
import { useRouter } from 'next/router'
import { useSingleActivitySessionSWR } from './activitySession/useSingleActivitySessionSWR'
import { useSingularCourseSessionSWR } from './courseSession/useSingularCourseSessionSWR'
import { useGamesSWR } from './games/useGamesSWR'

export const useGameTypeData = ({ type = 'free' }: QuizProps) => {
    const {
        query: { id },
    } = useRouter()

    const game = useGamesSWR(id as string, undefined, type === 'free')
    const courseSession = useSingularCourseSessionSWR({
        id: id as string,
        enabled: type === 'course',
    })
    const { data: activitySession } = useSingleActivitySessionSWR({
        enabled: type === 'activity',
    })

    return type === 'free'
        ? game
        : type === 'course'
        ? courseSession?.gameSession
        : activitySession?.gameSession
}
