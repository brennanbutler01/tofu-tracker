import {
    Button,
    Card,
    Col,
    Form,
    InputRef,
    Row,
    Skeleton,
    Space,
    Statistic,
    Typography,
} from 'antd'
import DeleteItem from '@/components/DeleteItem'
import { Models } from '@/utils/message.utils'
import {
    LineChartOutlined,
    PlayCircleOutlined,
    RedoOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { useUnfinishedGameCRUD } from '@/services/games/unfinishedGames/useUnfinishedGameCRUD'
import { GameWithOptions } from '@/pages/api/games/unfinished'
import { CorrectStatus } from '@prisma/client'
import { StyledCard } from './QuizCard'
import TimestampTag from '@/components/TimestampTag'
import { GameTitleModal } from '@/components/game/GameTitleModal'
import { useRouter } from 'next/router'
import { useGameCRUD } from '@/services/games/useGameCRUD'
import React, { useRef } from 'react'
const { Meta } = Card,
    { Text } = Typography

export interface IGameHistory {
    data: Array<GameWithOptions>
    loading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const GameHistory = ({ data, loading, setLoading }: IGameHistory) => {
    console.log(data)
    const { deleteGame } = useUnfinishedGameCRUD()
    const { createGameSession } = useGameCRUD()
    const [form] = Form.useForm()
    const { push } = useRouter()
    const inputRef = useRef<InputRef>(null)

    return (
        <Row gutter={32}>
            {data.map(game => {
                return (
                    <Col
                        span={12}
                        xs={24}
                        sm={12}
                        md={10}
                        lg={8}
                        xxl={4}
                        key={game.id}
                    >
                        <Skeleton loading={loading} active>
                            <StyledCard
                                loading={loading}
                                actions={
                                    game?.isComplete
                                        ? [
                                              <Button
                                                  key={'replay'}
                                                  icon={<RedoOutlined />}
                                                  size={'small'}
                                                  type={'text'}
                                                  onClick={() => {
                                                      GameTitleModal({
                                                          form,
                                                          push,
                                                          createGameSession,
                                                          questions:
                                                              game.questions,
                                                          setLoadingGame:
                                                              setLoading,
                                                          ref: inputRef,
                                                      })

                                                      setTimeout(() => {
                                                          inputRef?.current?.focus(
                                                              {}
                                                          )
                                                      }, 250)
                                                  }}
                                              >
                                                  <a>Play Again</a>
                                              </Button>,
                                              <Button
                                                  key={'view'}
                                                  icon={<LineChartOutlined />}
                                                  size={'small'}
                                                  type={'text'}
                                              >
                                                  <Link legacyBehavior
                                                      href={`/play/game/review/${game.id}`}
                                                  >
                                                      <a>Results</a>
                                                  </Link>
                                              </Button>,
                                          ]
                                        : [
                                              <Button
                                                  key={'resume'}
                                                  icon={<PlayCircleOutlined />}
                                                  size={'small'}
                                                  type={'text'}
                                              >
                                                  <Link legacyBehavior
                                                      href={`/play/game/${game.id}`}
                                                  >
                                                      <a>Resume</a>
                                                  </Link>
                                              </Button>,
                                              <DeleteItem
                                                  key={'delete'}
                                                  onDelete={async () =>
                                                      await deleteGame(game.id)
                                                  }
                                                  model={Models.GAME}
                                              />,
                                          ]
                                }
                            >
                                <Meta
                                    title={
                                        <Space
                                            direction={'vertical'}
                                            style={{ width: '100%' }}
                                        >
                                            <Text ellipsis>{game.title}</Text>
                                            <TimestampTag
                                                date={game.updatedAt}
                                            />
                                        </Space>
                                    }
                                    description={
                                        <Row
                                            gutter={[16, 16]}
                                            style={{ marginTop: '1.5vh' }}
                                        >
                                            <Col span={12}>
                                                <Statistic
                                                    title={'Current'}
                                                    value={game.currentQuestion}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title={'Remaining'}
                                                    value={
                                                        game?.isComplete
                                                            ? 0
                                                            : game.questions
                                                                  ?.length -
                                                              game.currentQuestion
                                                    }
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title={'Answered'}
                                                    value={game.numberAnswered}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title={'Correct'}
                                                    value={game.numberCorrect}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title={'To Grade'}
                                                    value={
                                                        game.answerHistory?.filter(
                                                            a =>
                                                                a.isCorrect ===
                                                                CorrectStatus?.NEEDS_GRADED
                                                        )?.length
                                                    }
                                                />
                                            </Col>
                                        </Row>
                                    }
                                />
                            </StyledCard>
                        </Skeleton>
                    </Col>
                )
            })}
        </Row>
    )
}
export default GameHistory
