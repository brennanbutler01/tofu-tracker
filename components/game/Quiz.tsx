import QuizCard from '@/components/game/QuizCard'
import ProgressBar from '@/components/ProgressBar'
import { Col, Row } from 'antd'
import { useGameTypeData } from '@/services/useGameTypeData'

export type QuizTypes = 'free' | 'course' | 'activity'

export interface QuizProps {
    type?: QuizTypes
}

const Quiz = ({ type = 'free' }: QuizProps) => {
    const ourSession = useGameTypeData({ type })

    return (
        <Row style={{ marginTop: '15px' }}>
            <Col span={24}>
                <Row justify={'center'} gutter={[0, 16]}>
                    <Col span={20}>
                        <ProgressBar
                            percent={Math.round(
                                (ourSession?.currentQuestion /
                                    ourSession?.questions?.length) *
                                    100
                            )}
                        />
                    </Col>
                    <Col span={20} md={12} lg={8} xxl={6}>
                        <QuizCard type={type} />
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}
export default Quiz
