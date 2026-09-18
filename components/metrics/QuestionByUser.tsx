import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts'
import { useTheme } from 'styled-components'
import { StyledCard } from '@/components/game/QuizCard'
import { Card, Typography } from 'antd'

export interface IQuestionByUserData {
    title: string
    passed: number
    failed: number
}

interface IQuestionByUser {
    data: Array<IQuestionByUserData>
}

const QuestionByUser = ({ data }: IQuestionByUser) => {
    const theme = useTheme()

    const CustomTooltip = ({
        active,
        payload,
        label,
    }: TooltipProps<any, any>) => {
        if (active && payload && payload.length) {
            return (
                <StyledCard style={{ opacity: '.85' }}>
                    <Card.Meta
                        title={
                            <Typography.Title level={3}>
                                {label}
                            </Typography.Title>
                        }
                        description={<div>we need to put people here...</div>}
                    />
                </StyledCard>
            )
        }
        return <></>
    }

    return (
        <ResponsiveContainer width='100%' height={300}>
            <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                    dataKey='email'
                    tickFormatter={(val: string, i: number) => {
                        console.log('val', val)
                        const limit = 15
                        if (val.length < limit) return val
                        return `${val.substring(0, limit)}...`
                    }}
                />
                <YAxis />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ opacity: 0.25, fill: theme['tofu-purple'] }}
                />
                <Legend />
                <Bar
                    dataKey='incorrect'
                    stackId='a'
                    fill={'rgb(180, 55, 120)'}
                />
                <Bar dataKey='correct' stackId='a' fill={'rgb(0, 114, 75)'} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default QuestionByUser
