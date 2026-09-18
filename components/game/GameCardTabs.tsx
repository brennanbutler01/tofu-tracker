import { Space, Tabs } from 'antd'
import CommentList, { CommentTypes } from '@/components/game/CommentList'
import QuestionRating from '@/components/game/QuestionRating'
import ResourceList from '@/components/game/resources/ResourceList'
import styled from 'styled-components'
import { useFeedbackSWR } from '@/services/feedback/useFeedbackSWR'
import { QuizProps } from '@/components/game/Quiz'
import { useGameTypeData } from '@/services/useGameTypeData'

const { TabPane } = Tabs

export interface IGameCardTabs {
    feedbackQuestionId: string
}

const TabContainer = styled.div`
    &&& {
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab,
        .ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab {
            background-color: ${props => props.theme['tofu-brand-4']};
            border: 1px solid ${props => props.theme['tofu-brand-6']};
        }
        .ant-tabs-top > .ant-tabs-nav::before,
        .ant-tabs-bottom > .ant-tabs-nav::before,
        .ant-tabs-top > div > .ant-tabs-nav::before,
        .ant-tabs-bottom > div > .ant-tabs-nav::before {
            border-bottom: 1px solid ${props => props.theme['tofu-brand-6']};
        }
    }
`

const GameCardTabs = ({
    feedbackQuestionId,
    type = 'free',
}: IGameCardTabs & QuizProps) => {
    const feedback = useFeedbackSWR(feedbackQuestionId)
    const session = useGameTypeData({ type })

    return (
        <TabContainer>
            <Tabs destroyInactiveTabPane>
                <TabPane tab={'Comments'} key={'comments'}>
                    <Space
                        direction={'vertical'}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <CommentList
                            comments={feedback?.comments}
                            type={CommentTypes.QUESTION}
                            feedbackQuestionId={feedbackQuestionId}
                        />
                    </Space>
                </TabPane>
                <TabPane tab={'Rating'} key={'rating'}>
                    <QuestionRating
                        questionId={
                            session?.questions?.[session?.currentQuestion - 1]
                                ?.id
                        }
                    />
                </TabPane>
                <TabPane tab={'Resources'} key={'resources'}>
                    <ResourceList type={type} />
                </TabPane>
            </Tabs>
        </TabContainer>
    )
}

export default GameCardTabs
