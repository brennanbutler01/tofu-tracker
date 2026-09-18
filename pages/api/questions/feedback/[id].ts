import { apiHandler, identifier } from '@/server/apiHandler'
import {
    feedbackActionSchema,
    getQuestionFeedback,
    updateQuestionFeedback,
} from '@/server/questionFeedback'
export default apiHandler(['GET', 'POST', 'PUT'], async (req, res, viewer) => {
    const id = identifier.parse(req.query.id)
    if (req.method === 'GET') res.json(await getQuestionFeedback(id, viewer))
    else
        res.json(
            await updateQuestionFeedback(
                id,
                viewer,
                feedbackActionSchema.parse(req.body)
            )
        )
})
