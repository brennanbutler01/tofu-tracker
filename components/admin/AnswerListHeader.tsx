import { Checkbox, Col, Row, Tooltip, Typography } from 'antd'
import React from 'react'
import { useGradeAnswersSWR } from '@/services/toGrade/useGradeAnswersSWR'
const { Title } = Typography

interface IAnswerHeader {
    checkAll: boolean
    selectAllKeys: () => void
    indeterminate: boolean
}

const AnswerListHeader = ({
    selectAllKeys,
    checkAll,
    indeterminate,
}: IAnswerHeader) => {
    const answersToGrade = useGradeAnswersSWR({})
    return (
        <Row>
            <Col
                span={1}
                order={2}
                sm={{ order: 1 }}
                style={{ display: 'flex', alignItems: 'center' }}
            >
                {answersToGrade?.length > 1 && (
                    <Tooltip title={checkAll ? 'Unselect All' : 'Select All'}>
                        <Checkbox
                            checked={checkAll}
                            onChange={selectAllKeys}
                            indeterminate={indeterminate}
                        />
                    </Tooltip>
                )}
            </Col>
            <Col span={20} order={1} sm={{ order: 2 }}>
                <Title
                    level={3}
                    style={{ marginBottom: 0, whiteSpace: 'break-spaces' }}
                    ellipsis
                >
                    Free Responses to Grade
                </Title>
            </Col>
        </Row>
    )
}

export default AnswerListHeader
