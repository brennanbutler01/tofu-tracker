import { IQuestionStats } from '@/pages/api/metrics/questions/[...id]'
import { http } from '@/services/http'
import { useQuestionSWR } from '@/services/questions/useQuestionSWR'
import { Card, Form, Select, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'
import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend,
    Bar,
    TooltipProps,
    Tooltip,
} from 'recharts'
import { useTheme } from 'styled-components'
import { SelectContainer } from '../decks/DeckCategories'
import FormLabel from '../FormLabel'
import { StyledCard } from '../game/QuizCard'
const { Item } = Form,
    { Title } = Typography,
    { Meta } = Card

interface QuestionStatsProps {
    questions: Array<string>
}

export const QuestionStats = () => {
    const [form] = Form.useForm<QuestionStatsProps>()
    const questions = useQuestionSWR()

    const selectedQuestionIds = Form.useWatch('questions', form)

    const [questionData, setQuestionData] = useState<Array<IQuestionStats>>([])

    useEffect(() => {
        const fetchData = async () => {
            const url = `/metrics/questions/${selectedQuestionIds?.reduce(
                (acc, curr, i) => {
                    return (
                        acc +
                        `${curr}${
                            i === selectedQuestionIds?.length - 1 ? '' : '/'
                        }`
                    )
                },
                ''
            )}`

            await http
                .get<IQuestionStats[]>(url)
                .then(res => setQuestionData(res.data))
                .catch(console.error)
        }
        if (selectedQuestionIds?.length !== 0) {
            fetchData()
        } else {
            setQuestionData([])
        }
    }, [selectedQuestionIds])

    const theme = useTheme()

    const CustomTooltip = ({
        active,
        payload,
        label,
    }: TooltipProps<any, any>) => {
        if (active && payload && payload.length) {
            return (
                <StyledCard style={{ opacity: '.85' }}>
                    <Meta
                        title={<Title level={3}>{label}</Title>}
                        description={<div>we need to put people here...</div>}
                    />
                </StyledCard>
            )
        }
        return null
    }

    return (
        <Space style={{ width: '100%' }} direction='vertical'>
            <Form form={form} layout='vertical'>
                <SelectContainer>
                    <Item
                        label={<FormLabel label='Questions' />}
                        name='questions'
                    >
                        <Select
                            getPopupContainer={el =>
                                el.parentNode as HTMLElement
                            }
                            options={questions?.map(q => ({
                                label: q.question,
                                value: q.id,
                            }))}
                            mode='multiple'
                        />
                    </Item>
                </SelectContainer>
            </Form>
            <ResponsiveContainer width='100%' height={300}>
                <BarChart
                    width={500}
                    height={300}
                    data={questionData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='question' width={30} />
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
            </ResponsiveContainer>
        </Space>
    )
}
