import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts'
import { IUserAnswersByDay } from '@/pages/api/metrics/answersByDay/[user]'
import { Card, Statistic, Typography } from 'antd'
import { StyledCard } from '@/components/game/QuizCard'
const { Title } = Typography

interface IAnswersByDayChart {
    data: Array<IUserAnswersByDay>
}

const AnswersByDayChart = ({ data }: IAnswersByDayChart) => {
    const CustomTooltip = ({
        active,
        payload,
        label,
    }: TooltipProps<any, any>) => {
        if (active && payload && payload.length) {
            return (
                <StyledCard style={{ opacity: '.85' }}>
                    <Card.Meta
                        title={<Title level={3}>{label}</Title>}
                        description={
                            <Statistic
                                title={'Questions Answered'}
                                value={payload[0].value}
                            />
                        }
                    />
                </StyledCard>
            )
        }

        return null
    }

    return (
        // <ResponsiveContainer width="100%" height="100%">
        <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
                type='monotone'
                stroke='#8884d8'
                activeDot={{ r: 8 }}
                dataKey={'completed'}
            />
        </LineChart>
        // </ResponsiveContainer>
    )
}
export default AnswersByDayChart
