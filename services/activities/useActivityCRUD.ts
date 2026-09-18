import { message } from 'antd'
import { useSWRConfig } from 'swr'
import type { IActivityForm } from '@/components/activities/ActivityForm'
import { orderedSelection } from '@/utils/orderedSelection'
import { activityService } from './activityService'
export const ACTIVITY_URL = '/api/activities'
const activityInput = (values: IActivityForm) => ({
    title: values.title,
    description: values.description,
    displayOnMain: values.displayOnMain ?? false,
    percentToPass: values.percentToPass ?? 90,
    questionIds: orderedSelection(values.questions, values.questionOrder),
})
export const useActivityCRUD = () => {
    const { mutate } = useSWRConfig()
    const refresh = async (id?: string) => {
        await mutate(ACTIVITY_URL)
        await mutate('/api/questions')
        if (id) await mutate(`${ACTIVITY_URL}/${id}`)
    }
    const createActivity = async (values: IActivityForm) => {
        try {
            await activityService.createActivity(activityInput(values))
            await refresh()
            message.success('Activity created.')
            return true
        } catch {
            message.error(
                'Could not create this activity. Your entries are still here.'
            )
            return false
        }
    }
    const updateActivity = async ({
        id,
        ...values
    }: IActivityForm & { id: string }) => {
        try {
            await activityService.updateActivity(id, activityInput(values))
            await refresh(id)
            message.success('Activity saved.')
            return true
        } catch {
            message.error(
                'Could not save this activity. Your entries are still here.'
            )
            return false
        }
    }
    const deleteActivity = async ({ activityId }: { activityId: string }) => {
        try {
            await activityService.deleteActivity(activityId)
            await refresh()
            message.success(
                'Activity archived. Existing results are preserved.'
            )
            return true
        } catch {
            message.error('Could not archive this activity. Please try again.')
            return false
        }
    }
    return { createActivity, updateActivity, deleteActivity }
}
