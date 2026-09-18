import { Alert, Grid, Space } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import { StyledTag } from '@/decks/DeckTags'

const AlertWrapper = styled.div`
    .ant-alert-success {
        background-color: rgb(0, 60, 42);
        border-color: rgb(0, 114, 75);
    }

    .ant-alert-info {
        background-color: rgb(0, 36, 53);
        border: 1px solid rgb(0, 132, 215);
    }
    .ant-alert-error {
        background-color: rgb(60, 8, 0);
        border-color: rgb(119, 11, 0);
    }
`

export enum AnswerStatus {
    CORRECT,
    BLANK,
    INCORRECT,
    FREE_RESPONSE_NEEDS_GRADED,
    NEEDS_GRADED,
}

interface IAnswerStatus {
    status: AnswerStatus
    explanation?: string | null
    correctAnswer?: string
}
const AnswerStatusAlert = ({
    status,
    explanation,
    correctAnswer,
}: IAnswerStatus) => {
    const [visible, setVisible] = useState(true)
    const handleClose = () => setVisible(false)
    const alertProps = {
        showIcon: true,
        closable: false,
        visible: visible,
        afterClose: handleClose,
    }
    const breakpoint = Grid.useBreakpoint()

    return (
        <AlertWrapper>
            {visible ? (
                <>
                    {status === AnswerStatus.CORRECT ? (
                        <Alert
                            type={'success'}
                            message={'Correct answer!'}
                            description={explanation}
                            {...alertProps}
                        />
                    ) : status === AnswerStatus.INCORRECT ? (
                        <Alert
                            type={'error'}
                            message={'Incorrect answer!'}
                            description={
                                <Space
                                    style={{ width: '100%' }}
                                    direction={'vertical'}
                                >
                                    <StyledTag>
                                        {breakpoint.md ? (
                                            `Correct Answer: ${correctAnswer}`
                                        ) : (
                                            <Space direction={'vertical'}>
                                                <div>Correct Answer:</div>
                                                <div>{correctAnswer}</div>
                                            </Space>
                                        )}
                                    </StyledTag>
                                    {explanation}
                                </Space>
                            }
                            {...alertProps}
                        />
                    ) : status === AnswerStatus.FREE_RESPONSE_NEEDS_GRADED ? (
                        <Alert
                            type={'info'}
                            message={'Needs Graded!'}
                            description={
                                'Your response is waiting for a grade - Please check back soon!'
                            }
                            {...alertProps}
                        />
                    ) : null}
                </>
            ) : null}
        </AlertWrapper>
    )
}

export default AnswerStatusAlert
