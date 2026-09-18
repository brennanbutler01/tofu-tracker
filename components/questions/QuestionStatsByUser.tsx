import { Alert, Spin } from 'antd'
import useSWR from 'swr'
import { http } from '@/services/http'
import { userQuestionMetricSchema } from '@/utils/metricSchemas'
import ResultChart from '@/components/metrics/ResultChart'
export function QuestionStatsByUser({ id }: { id: string }) {
    const { data, error } = useSWR(
        '/metrics/question/' + encodeURIComponent(id),
        async url =>
            userQuestionMetricSchema
                .array()
                .parse((await http.get<unknown>(url)).data)
    )
    if (error)
        return (
            <Alert
                type='error'
                message='Could not load learner results. Refresh to try again.'
            />
        )
    if (!data) return <Spin />
    return (
        <ResultChart
            rows={data.map(row => ({
                ...row,
                id: row.userId,
                label: row.email,
            }))}
        />
    )
}
