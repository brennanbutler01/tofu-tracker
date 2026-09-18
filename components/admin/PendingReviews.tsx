import { Alert, List } from 'antd'
import Link from 'next/link'
import useSWR from 'swr'
import type { FullGradingSession } from '@/server/gradingShapes'

export default function PendingReviews() {
    const { data, error } = useSWR<FullGradingSession[]>('/api/toGrade/session')
    if (error)
        return (
            <Alert
                type='error'
                message='Could not load your unfinished reviews. Refresh to try again.'
            />
        )
    const pending = data?.filter(review => !review.isComplete) ?? []
    if (!pending.length) return null
    return (
        <List
            header='Your unfinished reviews'
            dataSource={pending}
            renderItem={review => (
                <List.Item key={review.id}>
                    <Link href={`/admin/grade/${review.id}`}>
                        Resume review:{' '}
                        {review.answersToGrade.find(
                            answer => answer.id === review.currentAnswer
                        )?.question.question ?? 'Written responses'}
                    </Link>
                </List.Item>
            )}
        />
    )
}
