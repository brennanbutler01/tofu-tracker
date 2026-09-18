import DeckQuestionTree from '@/components/game/DeckQuestionTree'
import QuestionSlider from '@/components/game/QuestionSlider'
import { Col, Form, Row, Space, Switch, TreeDataNode, Typography } from 'antd'
import TimeSelect from '@/components/game/TimeSelect'
import FormLabel from '@/components/FormLabel'
import { QuestionCircleOutlined } from '@ant-design/icons'
import React, { useCallback, useState } from 'react'
import { useGameDeckSWR } from '@/services/decks/game/useGameDeckSWR'
import { SwitchContainer } from '@/questions/QuestionForm'
import { StyledCard } from '@/components/game/QuizCard'

const { Item } = Form,
    { Title } = Typography
interface IGameConfig {
    selectedData: Array<TreeDataNode>
    setSelectedData: React.Dispatch<React.SetStateAction<Array<TreeDataNode>>>
    sliderValue: number
    setSliderValue: React.Dispatch<React.SetStateAction<number>>
    timeValue: number
    setTimeValue: React.Dispatch<React.SetStateAction<number>>
}

interface ConfigForm {
    deckQuestions: Array<string>
    numberQuestions: number
    timeSelect: number
}

const GameConfiguration = ({
    selectedData,
    setSelectedData,
    setSliderValue,
    sliderValue,
    timeValue,
    setTimeValue,
}: IGameConfig) => {
    const ourDecks = useGameDeckSWR()

    const sumOfTreeOptions = useCallback(() => {
        return selectedData?.reduce((acc, curr) => {
            //its a deck
            if (curr.toString().includes('d-')) {
                const length =
                    ourDecks?.find(d => d.id === curr.toString().substring(2))
                        ?.questions?.length || 0
                return acc + length
            }
            // else it is a question! (so we don't have a whole deck here, just can sum up the q)
            else {
                return acc + 1
            }
        }, 0)
    }, [ourDecks, selectedData])

    const [form] = Form.useForm<ConfigForm>()
    const [showAdditional, setShowAdditional] = useState(false)

    //TODO - figure out if we really want to use this to set timer, thing like that

    return (
        <Row justify={'center'}>
            <Col span={24} sm={20} md={16} lg={12} xxl={8}>
                <StyledCard
                    title={
                        <Title level={3} style={{ marginBottom: '10px' }}>
                            Configure your game
                        </Title>
                    }
                >
                    <Form<ConfigForm> form={form} layout={'vertical'}>
                        <Space direction='vertical'>
                            <Item
                                label={
                                    <FormLabel label={'Decks and Questions'} />
                                }
                                name={'decksQuestions'}
                                tooltip={{
                                    icon: <QuestionCircleOutlined />,
                                    title: 'Decks and questions',
                                }}
                                help={
                                    'Select and filter decks and questions to customize your learning.'
                                }
                            >
                                <DeckQuestionTree
                                    value={selectedData}
                                    onChange={setSelectedData}
                                />
                            </Item>
                            <Space>
                                <FormLabel label={'Show additional?'} />
                                <SwitchContainer>
                                    <Switch onChange={setShowAdditional} />
                                </SwitchContainer>
                            </Space>
                        </Space>
                        {showAdditional && (
                            <div style={{ marginTop: '16px' }}>
                                <Item
                                    label={
                                        <FormLabel
                                            label={'Number of questions'}
                                        />
                                    }
                                >
                                    <QuestionSlider
                                        max={sumOfTreeOptions()}
                                        value={sliderValue}
                                        onChange={setSliderValue}
                                    />
                                </Item>

                                <Item
                                    label={<FormLabel label={'Game Length'} />}
                                    name={'gameLength'}
                                >
                                    <TimeSelect
                                        value={timeValue}
                                        onChange={setTimeValue}
                                    />
                                </Item>
                            </div>
                        )}
                    </Form>
                </StyledCard>
            </Col>
        </Row>
    )
}

export default GameConfiguration
