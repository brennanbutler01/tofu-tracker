import { ReportControls } from './ReportControls'
import { useState } from 'react'
import { Alert, Select, Space, Spin } from 'antd'
import useSWR from 'swr'
import { http } from '@/services/http'
import { useQuestionSWR } from '@/services/questions/useQuestionSWR'
import { questionMetricSchema } from '@/utils/metricSchemas'
import ResultChart from './ResultChart'
export function QuestionStats() {
    const [selected, setSelected] = useState<string[]>([])
    const questions = useQuestionSWR()
    const key = selected.length
        ? '/metrics/questions/' + selected.map(encodeURIComponent).join('/')
        : null
    const { data, error } = useSWR(key, async url =>
        questionMetricSchema.array().parse((await http.get<unknown>(url)).data)
    )
    return (
        <Space style={{ width: '100%' }} direction='vertical'>
            <ReportControls>
                <Select
                    getPopupContainer={node => node.parentElement ?? node}
                    aria-label='Questions to report'
                    style={{ width: '100%' }}
                    placeholder='Choose questions'
                    options={questions?.map(question => ({
                        label: question.question,
                        value: question.id,
                    }))}
                    value={selected}
                    onChange={setSelected}
                    mode='multiple'
                />
            </ReportControls>
            {error ? (
                <Alert
                    type='error'
                    message='Could not load question results. Try selecting the questions again.'
                />
            ) : key && !data ? (
                <Spin />
            ) : (
                <ResultChart
                    rows={(data ?? []).map(row => ({
                        ...row,
                        label: row.question,
                    }))}
                />
            )}
        </Space>
    )
}
