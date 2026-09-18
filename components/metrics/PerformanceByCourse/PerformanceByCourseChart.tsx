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

export interface ICourseChartData {
    title: string
    passed: number
    failed: number
}

interface ICourseChart {
    data: Array<ICourseChartData>
}

const PerformanceByCourseChart = ({ data }: ICourseChart) => {
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
        // <ResponsiveContainer width="100%" height="100%">
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
            <XAxis dataKey='title' />
            <YAxis />
            <Tooltip
                content={<CustomTooltip />}
                cursor={{ opacity: 0.25, fill: theme['tofu-purple'] }}
            />
            <Legend />
            <Bar dataKey='failed' stackId='a' fill={'rgb(180, 55, 120)'} />
            <Bar dataKey='passed' stackId='a' fill={'rgb(0, 114, 75)'} />
        </BarChart>
        // </ResponsiveContainer>
    )
}

export default PerformanceByCourseChart
