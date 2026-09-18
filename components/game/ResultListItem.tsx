import { Badge, Col, List, Radio, Space, Typography } from 'antd'
import { CheckCircleTwoTone } from '@ant-design/icons'
import { GameAnswerWithQuestionAnswer } from '@/pages/api/games/[id]'
import { QuestionType } from '@prisma/client'
import { useEffect, useState } from 'react'

const {
        Item,
        Item: { Meta },
    } = List,
    { Group } = Radio,
    { Title, Text, Paragraph } = Typography

interface IResultList {
    i: number
    item: GameAnswerWithQuestionAnswer
}

const ResultListItem = ({ i, item }: IResultList) => {
    const [value, setValue] = useState<string | number>('')

    useEffect(() => {
        setValue(item?.userAnswer?.answer || '')
    }, [item])
    return (
        <Col span={22}>
            <Item key={item.id}>
                <Meta
                    title={
                        <Space direction={'vertical'}>
                            <Title level={5} style={{ marginBottom: 0 }}>
                                Question {++i}
                            </Title>
                            <Text>{item.question.question}</Text>
                        </Space>
                    }
                    description={
                        <Space direction={'vertical'} size={'large'}>
                            {item.question.type ===
                                QuestionType.FREE_RESPONSE ||
                            item.question.type ===
                                QuestionType.SIMPLE_RESPONSE ? (
                                <Space
                                    direction={'vertical'}
                                    style={{ marginTop: '5px' }}
                                    size={'small'}
                                >
                                    <Paragraph
                                        strong
                                        style={{ marginBottom: 0 }}
                                    >
                                        User Answer
                                    </Paragraph>
                                    <Paragraph
                                        type={'secondary'}
                                        ellipsis
                                        title={item?.userAnswer?.answer}
                                        style={{ whiteSpace: 'break-spaces' }}
                                    >
                                        {item?.userAnswer?.answer}
                                    </Paragraph>
                                </Space>
                            ) : (
                                <Group
                                    name={'answer'}
                                    defaultValue={item?.userAnswer?.answer}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    disabled
                                    options={item.question.options.map(opt => ({
                                        key: opt.id,
                                        value: opt.answer,
                                        label:
                                            item.question.correctAnswer ===
                                            opt.answer ? (
                                                <Badge
                                                    offset={[7, 2]}
                                                    count={
                                                        <CheckCircleTwoTone
                                                            twoToneColor={
                                                                '#52c41a'
                                                            }
                                                        />
                                                    }
                                                >
                                                    {opt.answer}
                                                </Badge>
                                            ) : (
                                                <>{opt.answer}</>
                                            ),
                                    }))}
                                />
                            )}
                        </Space>
                    }
                />
            </Item>
        </Col>
    )
}
export default ResultListItem
