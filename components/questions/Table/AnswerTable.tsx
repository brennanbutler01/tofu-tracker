import React, { useState } from 'react'
import { Table } from 'antd'
import styled from 'styled-components'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import useOptionsColumns from '@/components/answers/OptionsColumns'
import AnswerTableFooter from '@/components/answers/AnswerTableFooter'

interface IAnswerTable {
    correctAnswer: string
    question: QuestionWithOptions
}

const StyledDiv = styled.div`
    padding: 2.5vh 5vw;

    .ant-table-thead > tr > th {
        font-weight: 700;
        font-size: 0.9rem;
    }

    .ant-table-tbody > tr > td > .ant-table-wrapper:only-child .ant-table,
    .ant-table-tbody,
    > tr,
    > td,
    > .ant-table-expanded-row-fixed,
    > .ant-table-wrapper:only-child,
    .ant-table {
        margin: 0;
    }

    .ant-table.ant-table-middle,
    .ant-table-tbody,
    .ant-table-wrapper:only-child,
    .ant-table {
        margin: 0 !important;
    }

    .ant-table-footer {
        background-color: ${props => props.theme['tofu-brand-4']};
    }
`

const AnswerTable = ({ correctAnswer, question }: IAnswerTable) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const optionsColumns = useOptionsColumns(correctAnswer)

    return (
        <StyledDiv>
            <Table
                columns={optionsColumns}
                dataSource={question.options}
                rowKey={'id'}
                pagination={false}
                size={'small'}
                rowSelection={{
                    selectedRowKeys,
                    onChange: rows => setSelectedRowKeys(rows),
                }}
                footer={() => (
                    <AnswerTableFooter
                        question={question}
                        selectedRowKeys={selectedRowKeys}
                    />
                )}
            />
        </StyledDiv>
    )
}

export default AnswerTable
