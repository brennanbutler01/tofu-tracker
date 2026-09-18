import { http } from '@/services/http'
import { Card, Col, Divider, Row, Space, Statistic, Typography } from 'antd'
import { useEffect, useState } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    PieLabel,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts'
import { useTheme } from 'styled-components'
import FormLabel from '../FormLabel'
import { StyledCard } from '../game/QuizCard'
const { Meta } = Card,
    { Title } = Typography

const RADIAN = Math.PI / 180

interface IQuestionStatsByUser {
    data: Array<IQuestionStatsByUser>
}

interface IProps {
    id: string
}

export const QuestionStatsByUser = ({ id }: IProps) => {
    const theme = useTheme()
    const [data, setData] = useState<Array<IQuestionStatsByUser>>([])

    useEffect(() => {
        let isSubscribed = true

        const getData = () => {
            const fetch = async () => {
                await http
                    .get<Array<IQuestionStatsByUser>>(`/metrics/question/${id}`)
                    .then(res => {
                        console.log('res', res.data)
                        setData(res.data)
                    })
            }
            fetch()
        }

        if (isSubscribed) {
            getData()
        }

        return () => {
            isSubscribed = false
        }
    }, [id])

    const renderPieLabel: PieLabel<any> = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index,
    }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        console.log(index, percent)

        return (
            <text
                x={x}
                y={y}
                fill='white'
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline='central'
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    const CustomTooltip = ({
        active,
        payload,
        label,
    }: TooltipProps<any, any>) => {
        if (active && payload && payload.length) {
            const data = [
                { answers: payload[0].payload.correct },
                { answers: payload[0].payload.incorrect },
            ]

            return (
                <StyledCard style={{ opacity: '.85' }}>
                    <Meta
                        title={<Title level={3}>{label}</Title>}
                        description={
                            <Space direction='vertical'>
                                <Space size='large'>
                                    <Statistic
                                        value={payload[0].payload.correct}
                                        title='Correct'
                                    />
                                    <Divider />
                                    <Statistic
                                        value={payload[0].payload.incorrect}
                                        title='Incorrect'
                                    />
                                </Space>
                                <Space size='small'>
                                    <FormLabel label={'Answer distribution'} />
                                    <PieChart width={150} height={150}>
                                        <Pie
                                            data={data}
                                            dataKey='answers'
                                            cx='50%'
                                            cy='50%'
                                            outerRadius={70}
                                            label={renderPieLabel}
                                            isAnimationActive={false}
                                        >
                                            {data.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={
                                                        index === 0
                                                            ? 'rgb(0, 114, 75)'
                                                            : 'rgb(180, 55, 120)'
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </Space>
                            </Space>
                        }
                    />
                </StyledCard>
            )
        }
        return <></>
    }

    console.log('ourData', data)

    return (
        <Row>
            <Col span={24}>
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
                        tickFormatter={val => {
                            const size = 12
                            if (val.length > size) {
                                return `${val.substr(0, size)}...`
                            }
                            return val
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
                    <Bar
                        dataKey='correct'
                        stackId='a'
                        fill={'rgb(0, 114, 75)'}
                    />
                </BarChart>
            </Col>
        </Row>
    )
}
