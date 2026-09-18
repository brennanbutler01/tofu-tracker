import { Collapse, List, Space, Tabs } from 'antd'
import React, { useContext, useEffect } from 'react'
import FreeGradingForm from '@/components/admin/FreeGradingForm'
import { useRouter } from 'next/router'
import { useGradingSessionSWR } from '@/services/gradingSession/useGradingSessionSWR'
import styled from 'styled-components'
import CritiqueForm from '@/components/admin/CritiqueForm'
import GradingResourceForm from '@/components/admin/GradingResourceForm'
import { CorrectStatus } from '@prisma/client'
import { TabKey, tabKeys } from '@/components/admin/GradingCard'
import AvatarWithFallback from '@/components/game/AvatarWithFallback'
import { StyledTag } from '@/decks/DeckTags'
import { GradingContext } from '@/pages/admin/grade/[id]'
import { CollapseWrapper } from '@/components/game/QuizResults'

const { TabPane } = Tabs,
    { Panel } = Collapse,
    {
        Item,
        Item: { Meta },
    } = List

const TabContainer = styled.div`
    .ant-tabs-top > .ant-tabs-nav::before,
    .ant-tabs-bottom > .ant-tabs-nav::before,
    .ant-tabs-top > div > .ant-tabs-nav::before,
    .ant-tabs-bottom > div > .ant-tabs-nav::before {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
    }
`

export interface IGradingTabs {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    loading: boolean
    next: () => void
}

interface IKeys {
    tabKey: TabKey
    setCurrentStep: (step: number) => void
}

const GradingTabs = ({
    setLoading,
    loading,
    tabKey,
    setCurrentStep,
    next,
}: IGradingTabs & IKeys) => {
    const {
        query: { id },
    } = useRouter()
    const gradingSession = useGradingSessionSWR({
        gradingSessionId: id?.toString(),
    })
    const currentAnswer = useContext(GradingContext)

    useEffect(() => {
        setCurrentStep(0)
    }, [setCurrentStep, gradingSession?.currentAnswer])

    return (
        <TabContainer>
            <Tabs
                tabPosition={'bottom'}
                destroyInactiveTabPane
                activeKey={tabKey}
                onChange={e => setCurrentStep(tabKeys.indexOf(e))}
            >
                <TabPane tab={'Response'} key={'response'}>
                    <FreeGradingForm
                        loading={loading}
                        setLoading={setLoading}
                        next={next}
                    />
                </TabPane>
                <TabPane
                    tab={'Critique'}
                    key={'critique'}
                    disabled={
                        currentAnswer?.isCorrect === CorrectStatus.NEEDS_GRADED
                    }
                >
                    <CritiqueForm
                        loading={loading}
                        setLoading={setLoading}
                        next={next}
                    />
                </TabPane>
                <TabPane
                    tab={'Resource'}
                    key={'resource'}
                    disabled={!currentAnswer?.critique?.critique}
                >
                    <CollapseWrapper>
                        <Collapse bordered={false} ghost={true}>
                            <Panel key={'resourceForm'} header={'Add Resource'}>
                                <GradingResourceForm
                                    loading={loading}
                                    setLoading={setLoading}
                                    next={next}
                                />
                            </Panel>
                        </Collapse>
                    </CollapseWrapper>
                    <List
                        loading={loading}
                        dataSource={currentAnswer?.critique?.resources}
                        renderItem={item => (
                            <Item
                                key={item.id}
                                extra={item.tags.map(tag => (
                                    <StyledTag key={tag}>{tag}</StyledTag>
                                ))}
                            >
                                <Meta
                                    avatar={
                                        <AvatarWithFallback
                                            user={gradingSession?.gradedBy}
                                        />
                                    }
                                    title={
                                        <Space>
                                            <a
                                                href={
                                                    item.location.startsWith(
                                                        'https://'
                                                    )
                                                        ? item.location
                                                        : undefined
                                                }
                                            >
                                                {item.title}
                                            </a>
                                        </Space>
                                    }
                                    description={item.description}
                                />
                            </Item>
                        )}
                    />
                </TabPane>
            </Tabs>
        </TabContainer>
    )
}

export default GradingTabs
