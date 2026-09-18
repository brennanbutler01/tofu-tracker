import TrackCourseSelect from '@/components/learningTracks/TrackCourseSelect'
import { useState } from 'react'
import { Alert, Space, Spin } from 'antd'
import { ReportControls } from '@/components/metrics/ReportControls'
import { http } from '@/services/http'
import useSWR from 'swr'
import { courseMetricSchema } from '@/utils/metricSchemas'
import PerformanceByCourseChart from './PerformanceByCourseChart'
export default function PerformanceByCourse() {
    const [courses, setCourses] = useState<string[]>([])
    const key = courses.length
        ? '/metrics/courses/' + courses.map(encodeURIComponent).join('/')
        : null
    const { data, error } = useSWR(key, async url =>
        courseMetricSchema.array().parse((await http.get<unknown>(url)).data)
    )
    return (
        <Space style={{ width: '100%' }} direction='vertical'>
            <ReportControls>
                <TrackCourseSelect value={courses} onChange={setCourses} />
            </ReportControls>
            {error ? (
                <Alert
                    type='error'
                    message='Could not load course results. Try selecting the courses again.'
                />
            ) : key && !data ? (
                <Spin />
            ) : (
                <PerformanceByCourseChart data={data ?? []} />
            )}
        </Space>
    )
}
