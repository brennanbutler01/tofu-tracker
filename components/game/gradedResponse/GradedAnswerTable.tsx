import { Col, Grid, Row, Table, Typography } from 'antd'
import FormLabel from '@/components/FormLabel'
import ResourcesTable from '@/components/game/gradedResponse/ResourcesTable'
import { StyledTag } from '@/decks/DeckTags'
import { ColumnsType } from 'antd/es/table'
import { GradedUserResponse } from '@/pages/api/graded'
import { CorrectStatus } from '@prisma/client'
import { useTheme } from 'styled-components'
import { useGradedResponsesSWR } from '@/services/useGradedResponsesSWR'
import { ResponseFilters } from '@/components/game/gradedResponse/GradedResponse'
import { useCallback, useEffect, useState } from 'react'
import TimestampTag from '@/components/TimestampTag'

const { Paragraph } = Typography

interface IGraded {
    filter: ResponseFilters
}

const GradedAnswerTable = ({ filter }: IGraded) => {
    const theme = useTheme()
    const responses = useGradedResponsesSWR()
    const [tableData, setTableData] = useState(responses)
    const breakpoint = Grid.useBreakpoint()

    const filterFunction = useCallback(
        (r: GradedUserResponse) => {
            let response: boolean
            switch (filter) {
                case ResponseFilters.CORRECT:
                case ResponseFilters.INCORRECT:
                    response =
                        r.isCorrect ===
                        (filter === ResponseFilters.CORRECT
                            ? CorrectStatus.TRUE
                            : CorrectStatus.FALSE)
                    break
                default:
                    response = true
            }
            return response
        },
        [filter]
    )

    useEffect(() => {
        if (responses) {
            setTableData(responses.filter(filterFunction))
        }
    }, [filterFunction, responses, filter])

    return (
        <Table
            bordered
            rowKey={'id'}
            dataSource={tableData}
            expandable={{
                expandedRowRender: record => (
                    <Row gutter={[16, 8]}>
                        <Col span={16}>
                            <FormLabel label={'Critique'} />
                        </Col>
                        {!breakpoint.sm && (
                            <Col span={8}>
                                <TimestampTag date={record.updatedAt} />
                            </Col>
                        )}
                        <Col span={20}>
                            <Paragraph>{record?.userAnswer?.answer}</Paragraph>
                        </Col>
                        <Col span={24}>
                            {(record?.critique?.resources?.length || 0) > 0 && (
                                <ResourcesTable record={record} />
                            )}
                        </Col>
                    </Row>
                ),
                rowExpandable: record => !!record?.critique,
            }}
            columns={
                [
                    {
                        title: 'Question',
                        dataIndex: ['question', 'question'],
                        key: 'question',
                        // render: (_, record) => record.question.question,
                    },
                    {
                        title: 'Correct?',
                        dataIndex: 'isCorrect',
                        key: 'key',
                        align: 'center',
                        render: (_, record) => (
                            <StyledTag
                                color={
                                    record?.isCorrect === CorrectStatus.TRUE
                                        ? theme['tofu-green-background']
                                        : theme['tofu-blood']
                                }
                            >
                                {record.isCorrect}
                            </StyledTag>
                        ),
                    },
                    {
                        title: 'Graded',
                        key: 'graded',
                        //  ONLY SHOW @ SM AND GREATER
                        responsive: ['sm'],
                        render: (_, record) => (
                            <TimestampTag date={record.updatedAt} />
                        ),
                        width: '15%',
                    },
                ] as ColumnsType<GradedUserResponse>
            }
        />
    )
}

export default GradedAnswerTable
