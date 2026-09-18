import styled from 'styled-components'
import { Table } from 'antd'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
const ReportFrame = styled.div`
    width: 100%;
    min-width: 0;
    && .ant-table-thead > tr > th {
        background: #393b49;
        color: #f0f0f4;
    }
    && .ant-table-tbody > tr > td {
        border-color: #555766;
    }
`
interface ResultRow {
    id: string
    label: string
    correct: number
    incorrect: number
    pending: number
    inProgress?: number
}
interface ResultChartProps {
    rows: ResultRow[]
    correctLabel?: string
    incorrectLabel?: string
    showProgress?: boolean
}
export default function ResultChart({
    rows,
    correctLabel = 'Correct',
    incorrectLabel = 'Incorrect',
    showProgress = false,
}: ResultChartProps) {
    return (
        <ReportFrame>
            <ResponsiveContainer width='100%' height={300}>
                <BarChart
                    data={rows}
                    margin={{ top: 15, right: 10, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                        tick={{ fill: '#c4c5d0' }}
                        dataKey='label'
                        tickFormatter={(label: string) =>
                            label.length > 18 ? label.slice(0, 18) + '…' : label
                        }
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#c4c5d0' }} />
                    <Tooltip
                        contentStyle={{
                            background: '#262733',
                            color: '#f0f0f4',
                            borderColor: '#686b7a',
                        }}
                        cursor={{ fill: '#aab0c0', opacity: 0.08 }}
                    />
                    <Legend />
                    <Bar
                        isAnimationActive={false}
                        dataKey='correct'
                        name={correctLabel}
                        stackId='answers'
                        fill='rgb(0, 114, 75)'
                    />
                    <Bar
                        isAnimationActive={false}
                        dataKey='incorrect'
                        name={incorrectLabel}
                        stackId='answers'
                        fill='rgb(180, 55, 120)'
                    />
                    <Bar
                        isAnimationActive={false}
                        dataKey='pending'
                        name='Awaiting review'
                        stackId='answers'
                        fill='#bc8b23'
                    />
                    {showProgress && (
                        <Bar
                            isAnimationActive={false}
                            dataKey='inProgress'
                            name='In progress'
                            stackId='answers'
                            fill='#6b79b8'
                        />
                    )}
                </BarChart>
            </ResponsiveContainer>
            <Table
                rowKey='id'
                size='small'
                dataSource={rows}
                pagination={false}
                scroll={{ x: true }}
                columns={[
                    { title: 'Item', dataIndex: 'label' },
                    { title: correctLabel, dataIndex: 'correct' },
                    { title: incorrectLabel, dataIndex: 'incorrect' },
                    { title: 'Awaiting review', dataIndex: 'pending' },
                    ...(showProgress
                        ? [{ title: 'In progress', dataIndex: 'inProgress' }]
                        : []),
                ]}
            />
        </ReportFrame>
    )
}
