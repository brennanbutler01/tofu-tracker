import useSWR from 'swr'
import { Question } from '@prisma/client'

//TODO- type this and make it more flexible.
//this hook is used to have a custom useSWR hook where we get the data for our questions.
export const useQuestionSWR = (
    fallbackData?: Question[],
    thisDeck?: string
) => {
    const { data } = useSWR(`/api/questions/${thisDeck || ''}`, {
        fallbackData,
    })

    return data as Array<Question>
}
