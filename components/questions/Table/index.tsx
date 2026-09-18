import React from 'react'
import { Button, Empty, Form, Grid, List, Skeleton, Table } from 'antd'
import { ColumnType } from 'antd/es/table'
import EditableCell from '@/questions/Table/EditableCell'
import { TableContainer } from './styles'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import { useQuestionTableColumns } from '@/questions/Table/useQuestionTableColumns'
import { useEditableConfig } from '@/questions/Table/editableConfig'
import TableTabs from '@/questions/Table/TableTabs'
import { QuestionListItem } from './QuestionListItem'

interface IQuestionTable {
    data: Array<QuestionWithOptions>
    emptyClick: () => void
}

const QuestionTable = ({ data, emptyClick }: IQuestionTable) => {
    const [form] = Form.useForm()
    const { isEditing, edit, saveEdit } = useEditableConfig({ form })
    const { mergedColumns, expandedRowKeys } = useQuestionTableColumns({
        isEditing,
        edit,
        saveEdit,
    })
    const breakpoint = Grid.useBreakpoint()

    return (
        <TableContainer>
            {breakpoint.sm ? (
                <Form form={form} component={false} name={'Table Form'}>
                    <Skeleton loading={!data} active>
                        <Table
                            columns={
                                mergedColumns as Array<
                                    ColumnType<QuestionWithOptions>
                                >
                            }
                            components={{
                                body: {
                                    cell: EditableCell,
                                },
                            }}
                            dataSource={data}
                            expandable={{
                                showExpandColumn: false,
                                expandedRowKeys,
                                expandedRowRender: record => (
                                    <TableTabs record={record} />
                                ),
                            }}
                            loading={!data}
                            locale={{
                                emptyText: (
                                    <Empty description={'No Questions'}>
                                        <Button onClick={emptyClick}>
                                            Create Question
                                        </Button>
                                    </Empty>
                                ),
                            }}
                            rowKey={'id'}
                            size={'middle'}
                        />
                    </Skeleton>
                </Form>
            ) : (
                <List
                    dataSource={data}
                    itemLayout='vertical'
                    renderItem={(item, i) => (
                        <QuestionListItem item={item} index={i} />
                    )}
                />
            )}
        </TableContainer>
    )
}

export default QuestionTable
