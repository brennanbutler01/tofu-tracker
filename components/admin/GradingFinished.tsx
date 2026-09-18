import { Result, Space, Statistic, Typography } from 'antd'
import AnswersToGrade from '@/components/admin/AnswersToGrade'
import { useGradingSessionSWR } from '@/services/gradingSession/useGradingSessionSWR'
import { useRouter } from 'next/router'
const { Paragraph } = Typography

const GradingFinished = () => {
    const {
        query: { id },
    } = useRouter()
    const gradingSession = useGradingSessionSWR({
        gradingSessionId: id as string,
    })
    return (
        <Result
            status={'success'}
            title={'Grading Session finished.'}
            subTitle={
                <Space direction={'vertical'} style={{ paddingTop: '10px' }}>
                    <Statistic
                        title={'Responses Graded'}
                        value={gradingSession?.answersToGrade?.length}
                    />
                    <Paragraph italic>
                        See below to grade some more questions!
                    </Paragraph>
                </Space>
            }
            extra={[<AnswersToGrade key={'answers-list'} />]}
        />
    )
}

export default GradingFinished
