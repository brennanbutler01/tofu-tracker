import { GradedResponseContainer } from '@/components/game/gradedResponse/styles'
import GradedAnswerTable from '@/components/game/gradedResponse/GradedAnswerTable'
import { Col, Row, Segmented } from 'antd'
import { useState } from 'react'

export enum ResponseFilters {
    ALL = 'all',
    CORRECT = 'correct',
    INCORRECT = 'incorrect',
}

const GradedResponse = () => {
    const [responseFilter, setResponseFilter] = useState(ResponseFilters.ALL)
    return (
        <GradedResponseContainer>
            <Row justify={'center'}>
                <Col span={24} sm={20} md={16}>
                    <Segmented
                        value={responseFilter}
                        onChange={k => setResponseFilter(k as ResponseFilters)}
                        options={[
                            { label: 'All', value: ResponseFilters.ALL },
                            {
                                label: 'Correct',
                                value: ResponseFilters.CORRECT,
                            },
                            {
                                label: 'Incorrect',
                                value: ResponseFilters.INCORRECT,
                            },
                        ]}
                    />
                    <GradedAnswerTable filter={responseFilter} />
                </Col>
            </Row>
        </GradedResponseContainer>
    )
}
export default GradedResponse
