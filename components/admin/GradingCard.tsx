import { Button, Skeleton, Typography, Modal } from 'antd'
import { StyledCard } from '@/components/game/QuizCard'
import React, { useCallback, useContext, useState } from 'react'
import styled from 'styled-components'
import { BackwardOutlined, ForwardOutlined } from '@ant-design/icons'
import GradingTabs from '@/components/admin/GradingTabs'
import { CorrectStatus } from '@prisma/client'
import { useGradingSessionCRUD } from '@/services/gradingSession/useGradingSessionCRUD'
import { GradingContext } from '@/pages/admin/grade/[id]'

const { Title } = Typography

export const tabKeys = ['response', 'critique', 'resource']
export type TabKey = typeof tabKeys[number]

const GradingContainer = styled.div`
    margin-top: 10px;
    width: 100%;

    &&& {
        .ant-steps-item-process
            > .ant-steps-item-container
            > .ant-steps-item-icon {
            background-color: ${props => props.theme['tofu-green-background']};
        }
        .ant-btn-dangerous.ant-btn-primary[disabled] {
            color: rgba(232, 230, 227, 0.25);
            border-color: rgb(99, 92, 82);
            background-color: rgb(30, 32, 33);
        }
    }
`

const GradingCard = () => {
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const incrementStep = () => setCurrentStep(currentStep + 1)
    const { moveGradingSession } = useGradingSessionCRUD()
    const currentAnswer = useContext(GradingContext)
    const callbackSetCurrent = useCallback((step: number) => {
        setCurrentStep(step)
    }, [])

    const next = () => {
        if (currentStep === 0) {
            if (currentAnswer?.isCorrect !== CorrectStatus.NEEDS_GRADED) {
                incrementStep()
            }
        } else if (currentStep === 1) {
            if (currentAnswer?.critique) {
                incrementStep()
            } else {
                Modal.confirm({
                    title: 'Are you sure you want to finish grading this response without adding a critique or any resources?',
                    okText: 'Yes',
                    cancelText: 'No',
                    maskClosable: true,
                    onOk: async () => {
                        Modal.destroyAll()
                        await moveGradingSession()
                    },
                })
            }
        }
    }
    const prev = () => setCurrentStep(currentStep - 1)

    return (
        <GradingContainer>
            <StyledCard
                title={
                    <Title level={3} style={{ marginBottom: 16 }}>
                        {currentAnswer?.question?.question}
                    </Title>
                }
                actions={[
                    <Button
                        loading={loading}
                        danger
                        type={'primary'}
                        key={'reset'}
                        icon={<BackwardOutlined />}
                        disabled={currentStep === 0}
                        onClick={prev}
                    >
                        Back
                    </Button>,
                    <Button
                        loading={loading}
                        type={'primary'}
                        key={'advance'}
                        icon={<ForwardOutlined />}
                        onClick={
                            currentStep === tabKeys.length - 1
                                ? () =>
                                      Modal.confirm({
                                          title: 'Are you ready to advance to the next question?',
                                          okText: 'Yes',
                                          cancelText: 'No',
                                          maskClosable: true,
                                          onOk: async () => {
                                              Modal.destroyAll()
                                              await moveGradingSession()
                                          },
                                      })
                                : next
                        }
                    >
                        Advance
                    </Button>,
                ]}
            >
                <Skeleton active loading={!currentAnswer}>
                    <GradingTabs
                        loading={loading}
                        setLoading={setLoading}
                        tabKey={tabKeys[currentStep]}
                        setCurrentStep={callbackSetCurrent}
                        next={next}
                    />
                </Skeleton>
            </StyledCard>
        </GradingContainer>
    )
}

export default GradingCard
