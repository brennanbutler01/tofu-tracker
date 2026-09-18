import styled from 'styled-components'
import { Button, Dropdown, Form, Grid, InputRef, Menu } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useGameCRUD } from '@/services/games/useGameCRUD'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import { CorrectStatus } from '@prisma/client'
import React, { useRef } from 'react'
import { GameTitleModal } from '@/components/game/GameTitleModal'
import { QuizProps } from '@/components/game/Quiz'
import { useGameTypeData } from '@/services/useGameTypeData'
import { useActivitySessionCRUD } from '@/services/activitySession/useActivitySessionCRUD'
import { useSingleActivitySessionSWR } from '@/services/activitySession/useSingleActivitySessionSWR'

const StyledWrapper = styled.div`
    .ant-dropdown-menu-item {
        background-color: ${props => props.theme['tofu-brand-3']};
        :hover {
            background-color: ${props => props.theme['tofu-brand-4']};
        }
    }
`

interface IPlayAgain extends QuizProps {
    loading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const PlayAgain = ({ loading, setLoading, type = 'free' }: IPlayAgain) => {
    const session = useGameTypeData({ type })
    const { data: activitySession, isLoading } = useSingleActivitySessionSWR({})
    const { createGameSession } = useGameCRUD()
    const breakpoint = Grid.useBreakpoint()
    const { push } = useRouter()
    const { createActivitySession } = useActivitySessionCRUD()
    const [form] = Form.useForm()

    //this filters our  previous game to get only the incorrect questions
    const getIncorrectQuestions = () =>
        session?.answerHistory.reduce((acc, curr) => {
            return curr?.isCorrect === CorrectStatus.FALSE
                ? [...acc, curr.question]
                : acc
        }, [] as Array<QuestionWithOptions>)

    const inputRef = useRef<InputRef>(null)

    //we will use this function to restart our game.
    const rebuildGame = (incorrectOnly = false) => {
        GameTitleModal({
            form,
            push,
            createGameSession,
            setLoadingGame: setLoading,
            questions: incorrectOnly
                ? //we will reduce our answer history array and find just those questions that we got wrong before
                  getIncorrectQuestions()
                : //otherwise we will return all the questions
                  session.questions,
            ref: inputRef,
        })
        setTimeout(() => {
            inputRef?.current?.focus({ cursor: 'all' })
        }, 250)
    }

    const restartActivity = async () => {
        setLoading(true)
        const id = await createActivitySession({
            activityId: activitySession?.activityId,
        })
        if (id) {
            await push(`/play/activity/${id}`)
        }
        setLoading(false)
    }

    return (
        <StyledWrapper>
            {type === 'activity' ? (
                <Button onClick={restartActivity}>Try activity again</Button>
            ) : (
                <Dropdown.Button
                    onClick={async () => await push('/play')}
                    getPopupContainer={el => el.parentNode as HTMLElement}
                    loading={loading}
                    size={breakpoint.md ? 'middle' : 'small'}
                    overlay={
                        <Menu
                            items={[
                                {
                                    key: 'new',
                                    label: (
                                        <Link legacyBehavior href={'/play'}>
                                            <a>New Game </a>
                                        </Link>
                                    ),
                                },
                                {
                                    key: 'replay',
                                    label: 'Replay Game',
                                    onClick: () => rebuildGame(),
                                },
                                {
                                    key: 'incorrect',
                                    label: 'Replay Incorrect Answers',
                                    onClick: () => rebuildGame(true),
                                    //if all our answers are correct or need graded, then there is nothing to replay
                                    disabled: session?.answerHistory?.every(
                                        answer =>
                                            answer?.isCorrect ===
                                                CorrectStatus.TRUE ||
                                            answer?.isCorrect ===
                                                CorrectStatus.NEEDS_GRADED
                                    ),
                                },
                            ]}
                        />
                    }
                >
                    New Game
                </Dropdown.Button>
            )}
        </StyledWrapper>
    )
}

export default PlayAgain
