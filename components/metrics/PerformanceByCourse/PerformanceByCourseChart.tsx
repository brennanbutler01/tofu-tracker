import ResultChart from '@/components/metrics/ResultChart'
import type { CourseMetric } from '@/utils/metricSchemas'
export type ICourseChartData = CourseMetric
export default function PerformanceByCourseChart({
    data,
}: {
    data: CourseMetric[]
}) {
    return (
        <ResultChart
            rows={data.map(row => ({
                id: row.id,
                label: row.title,
                correct: row.passed,
                incorrect: row.failed,
                pending: row.pending,
                inProgress: row.inProgress,
            }))}
            correctLabel='Passed'
            incorrectLabel='Failed'
            showProgress
        />
    )
}
