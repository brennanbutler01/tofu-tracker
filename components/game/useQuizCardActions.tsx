import { Button } from 'antd'
import {
    CommentOutlined,
    RadarChartOutlined,
    StepForwardOutlined,
} from '@ant-design/icons'
import { QuestionStatus } from '@/components/game/QuizCard'
import { useGameCRUD } from '@/services/games/useGameCRUD'
import { IQuizProps } from '@/components/game/QuizForm'
import React from 'react'
import { useFeedbackSWR } from '@/services/feedback/useFeedbackSWR'
import { useFeedbackCRUD } from '@/services/feedback/useFeedbackCRUD'
import { useCourseSessionCRUD } from '@/services/courseSession/useCourseSessionCRUD'
import { AnswerStatus } from '@/components/game/AnswerStatusAlert'
import { useGameTypeData } from '@/services/useGameTypeData'
import { useActivitySessionCRUD } from '@/services/activitySession/useActivitySessionCRUD'

interface IQuizCardActions extends IQuizProps {
    viewFeedback: boolean
    setViewFeedback: React.Dispatch<React.SetStateAction<boolean>>
    setFeedbackQuestionId: React.Dispatch<
        React.SetStateAction<string | undefined>
    >
}

const useQuizCardActions = ({
    setQuestionStatus,
    questionStatus,
    viewFeedback,
    setViewFeedback,
    setFeedbackQuestionId,
    setAnswerStatus,
    form,
    type = 'free',
}: IQuizCardActions) => {
    const { advanceGameQuestion } = useGameCRUD()
    const { advanceCourseQuestion } = useCourseSessionCRUD()
    const { advanceActivityGameQuestion } = useActivitySessionCRUD()

    const advanceQuestion = async () => {
        const advanced = await (type === 'free'
            ? advanceGameQuestion
            : type === 'course'
            ? advanceCourseQuestion
            : advanceActivityGameQuestion)()
        if (advanced) {
            setQuestionStatus(QuestionStatus.WAITING)
            setAnswerStatus(AnswerStatus.BLANK)
            setViewFeedback(false)
        }
    }

    const session = useGameTypeData({ type })
    const isLastQuestion =
        session?.currentQuestion === session?.questions?.length
    const current = session?.questions?.[session?.currentQuestion - 1]
    const feedback = useFeedbackSWR(current?.id)
    const { createQuestionFeedback } = useFeedbackCRUD(current?.id)

    return questionStatus === QuestionStatus.WAITING
        ? [
              <Button
                  danger
                  key={'reset'}
                  htmlType={'reset'}
                  form={'answerForm'}
              >
                  Reset
              </Button>,
              <Button
                  type={'primary'}
                  key={'confirm'}
                  htmlType={'submit'}
                  form={'answerForm'}
              >
                  Confirm
              </Button>,
          ]
        : [
              //TODO - take a look at where feedback might be appropriate to include - it doesn't seem like the way that we were doing it was right and was pretty clunky.
              //TODO = consider makinmg

              // <Button
              //   type={"dashed"}
              //   key={"feedback"}
              //   icon={<CommentOutlined />}
              //   onClick={async () => {
              //     //if we haven't made a feedback for this question yet, we will
              //     if (!feedback) {
              //       await createQuestionFeedback();
              //     }
              //     setFeedbackQuestionId(current?.id);
              //     setViewFeedback(!viewFeedback);
              //   }}
              // >
              //   {viewFeedback ? "Hide" : "Show"} Feedback
              // </Button>,
              <Button
                  icon={
                      isLastQuestion ? (
                          <RadarChartOutlined />
                      ) : (
                          <StepForwardOutlined />
                      )
                  }
                  type={'primary'}
                  key={'advance'}
                  htmlType={'reset'}
                  form={'answerForm'}
                  onClick={advanceQuestion}
              >
                  {isLastQuestion ? 'See Results' : 'Advance'}
              </Button>,
          ]
}

export default useQuizCardActions
