import { Card, Col, Row, Tabs, Typography } from 'antd'
import { useDeckQuestionsSWR } from '@/services/decks/questions/useDeckQuestionsSWR'
import { useRouter } from 'next/router'
import QuestionTable from '@/questions/Table'
import QuestionForm from '@/questions/QuestionForm'
import DeckForm, { FormCardWrapper } from '@/decks/DeckForm'
import styled from 'styled-components'
import { useState } from 'react'
import { StyledCard } from '../game/QuizCard'

const { TabPane } = Tabs,
    { Title } = Typography

const TabWrapper = styled.div`
    .ant-tabs-top > .ant-tabs-nav::before,
    .ant-tabs-bottom > .ant-tabs-nav::before,
    .ant-tabs-top > div > .ant-tabs-nav::before,
    .ant-tabs-bottom > div > .ant-tabs-nav::before {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-5']};
    }

    .ant-tabs-content-holder {
        margin-top: 3vh;
    }
`

export enum QuestionTabKeys {
    questions = 'questions',
    create = 'create',
    edit = 'edit',
}

const QuestionTabs = () => {
    const {
        query: { id },
    } = useRouter()
    const deckQuestions = useDeckQuestionsSWR(id as string)
    const [currentTab, setCurrentTab] = useState<QuestionTabKeys>(
        QuestionTabKeys.questions
    )

    return (
        <TabWrapper>
            <Tabs
                activeKey={currentTab}
                onChange={key =>
                    setCurrentTab(QuestionTabKeys[key as QuestionTabKeys])
                }
                destroyInactiveTabPane
            >
                <TabPane key={'questions'} tab={'Questions'}>
                    <QuestionTable
                        data={deckQuestions?.questions}
                        emptyClick={() => setCurrentTab(QuestionTabKeys.create)}
                    />
                </TabPane>
                <TabPane key={'create'} tab={'Create Question'}>
                    {/* <FormCardWrapper> */}
                    <Row align='middle' justify='center'>
                        <Col span={24} md={16} lg={12} xxl={10}>
                            <StyledCard
                                bordered={false}
                                title={
                                    <Title level={4} ellipsis>
                                        Create Question
                                    </Title>
                                }
                            >
                                <QuestionForm />
                            </StyledCard>
                        </Col>
                    </Row>
                    {/* </FormCardWrapper> */}
                </TabPane>
                <TabPane key={'edit'} tab={'Edit Deck'}>
                    <DeckForm editingDeck={deckQuestions} />
                </TabPane>
            </Tabs>
        </TabWrapper>
    )
}

export default QuestionTabs
