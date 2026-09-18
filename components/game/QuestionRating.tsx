import { Form, Rate } from 'antd'
import FormLabel from '@/components/FormLabel'
import { useFeedbackCRUD } from '@/services/feedback/useFeedbackCRUD'
import { useFeedbackSWR } from '@/services/feedback/useFeedbackSWR'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import type { QuestionRating } from '@prisma/client'
import { useTheme } from 'styled-components'
import FadeIn from 'react-fade-in'

interface IQuestionRating {
    questionId: string
}

const QuestionRating = ({ questionId }: IQuestionRating) => {
    const [form] = Form.useForm()
    const { rateQuestion } = useFeedbackCRUD(questionId)
    const feedback = useFeedbackSWR(questionId)
    const { data: session } = useSession()
    const [userRating, setUserRating] = useState<QuestionRating>()
    const [showPrevious, setShowPrevious] = useState(false)
    const [updatingRating, setUpdatingRating] = useState(false)

    useEffect(() => {
        const ourRating = feedback?.rating?.find(
            r => r.userId === session?.user?.userId
        )
        if (ourRating) {
            setUserRating(ourRating)
            form.setFieldsValue({ rating: ourRating.rating })
        }
    }, [form, feedback, session])

    const theme = useTheme()

    return (
        <div>
            <Form
                layout={'horizontal'}
                form={form}
                initialValues={{ rating: userRating?.rating || 3 }}
            >
                <Form.Item
                    label={<FormLabel label={'Rate your confidence'} />}
                    name={'rating'}
                    style={{ marginBottom: 2 }}
                >
                    <Rate
                        allowClear
                        allowHalf
                        onChange={async val => {
                            setUpdatingRating(true)
                            setShowPrevious(false)
                            await rateQuestion(val)
                            setUpdatingRating(false)
                        }}
                        onHoverChange={val =>
                            !updatingRating && setShowPrevious(true)
                        }
                    />
                </Form.Item>
                {userRating && showPrevious && (
                    <FadeIn>
                        <span style={{ color: theme['tofu-text-secondary'] }}>
                            Your previous rating was {userRating.rating}
                        </span>
                    </FadeIn>
                )}
            </Form>
        </div>
    )
}

export default QuestionRating
