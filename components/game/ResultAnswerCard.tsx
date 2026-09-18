import { Button, Col, Form, InputRef, List, Row, Space } from 'antd'
import ResultListItem from '@/components/game/ResultListItem'
import { useGamesSWR } from '@/services/games/useGamesSWR'
import { useRouter } from 'next/router'
import { AnswerFilter } from '@/components/game/ResultsSegment'
import Link from 'next/link'
import { CorrectStatus, GameTypes } from '@prisma/client'
import { GameAnswerWithQuestionAnswer } from '@/pages/api/games/[id]'
import { useGameCRUD } from '@/services/games/useGameCRUD'
import { StyledCard } from './QuizCard'
import styled from 'styled-components'
import { GameTitleModal } from '@/components/game/GameTitleModal'
import { useRef, useState } from 'react'

interface IResultAnswerCard {
    answerFilter: AnswerFilter
}

const CardWrapper = styled.div`
    .ant-list-split .ant-list-item {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
    }
`

const ResultAnswerCard = ({ answerFilter }: IResultAnswerCard) => {
    const {
        query: { id },
        push,
    } = useRouter()
    const swrGame = useGamesSWR(id as string)
    const { createGameSession } = useGameCRUD()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const getGameQuestions = () => swrGame?.answerHistory?.map(a => a.question)
    const inputRef = useRef<InputRef>(null)

    const rebuildGame = () => {
        GameTitleModal({
            form,
            setLoadingGame: setLoading,
            push,
            questions: getGameQuestions(),
            createGameSession,
            ref: inputRef,
        })

        setTimeout(() => {
            inputRef?.current?.focus({})
        }, 250)
    }

    //filter our displayed answers - only show what we have selected from the Resultssegmented options
    const filterAnswers = () => {
        return swrGame?.answerHistory?.filter(history =>
            answerFilter === 'Correct'
                ? history.isCorrect === CorrectStatus.TRUE
                : answerFilter === 'Incorrect'
                ? history.isCorrect === CorrectStatus.FALSE
                : answerFilter === 'Needs Graded'
                ? history.isCorrect === CorrectStatus.NEEDS_GRADED
                : history
        )
    }

    return (
        <CardWrapper>
            <Row justify={'center'} style={{ marginTop: '10px' }}>
                <Col span={20} sm={20} lg={12}>
                    <StyledCard
                        title={`${answerFilter} Answers`}
                        extra={
                            swrGame?.type === GameTypes.COURSE ||
                            swrGame?.type === GameTypes.FREE ? (
                                <Space>
                                    <Button
                                        onClick={rebuildGame}
                                        loading={loading}
                                    >
                                        Restart
                                    </Button>
                                    <Link legacyBehavior href={'/play'}>
                                        <a>
                                            <Button loading={loading}>
                                                New Game
                                            </Button>
                                        </a>
                                    </Link>
                                </Space>
                            ) : null
                        }
                    >
                        <List<GameAnswerWithQuestionAnswer>
                            dataSource={filterAnswers()}
                            renderItem={(item, i) => (
                                <ResultListItem i={i} item={item} />
                            )}
                            loading={!swrGame}
                        />
                    </StyledCard>
                </Col>
            </Row>
        </CardWrapper>
    )
}

export default ResultAnswerCard
