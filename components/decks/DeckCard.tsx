import Link from 'next/link'
import { Card, Col, Row, Statistic, Tooltip, Typography } from 'antd'
import React from 'react'
import { Deck, Roles } from '@prisma/client'
import { useSession } from 'next-auth/react'
import styled from 'styled-components'
import DeleteItem from '@/components/DeleteItem'
import { useDeckCRUD } from '@/services/decks/useDeckCRUD'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Models } from '@/utils/message.utils'
import { StyledTag } from '@/decks/DeckTags'
import { DeckWithQuestionCount } from '@/pages/api/decks'
import { StyledCard } from '../game/QuizCard'
const { Text } = Typography,
    { Meta } = Card

interface IDeckCard {
    isDeleting: boolean
    setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>
    deck: DeckWithQuestionCount
}

interface IDelete {
    deck: DeckWithQuestionCount
    role: Roles
    onDelete: (deck: Deck) => Promise<boolean>
    setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>
}

// only admin will see the delete icon + add list/more info.
const adminDelete = ({ deck, onDelete, setIsDeleting, role }: IDelete) => {
    return (
        role === Roles.ADMIN && {
            actions: [
                <DeleteItem
                    onDelete={async () => {
                        setIsDeleting(true)
                        const removed = await onDelete(deck)
                        setIsDeleting(false)
                        return removed
                    }}
                    key={'delete'}
                    model={Models.DECK}
                />,
                <Link
                    legacyBehavior
                    href={`/decks/${deck.id}`}
                    passHref={true}
                    key={'question'}
                >
                    <Tooltip title={'View Questions'}>
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Link>,
            ],
        }
    )
}

const TitleContainer = styled.div`
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
    `,
    TagContainer = styled.div`
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: ${props => props.theme['tofu-purple']};
    `

const DeckCard: React.FC<IDeckCard> = ({ isDeleting, setIsDeleting, deck }) => {
    const { data: session } = useSession()
    const { deleteDeck } = useDeckCRUD()

    return (
        <StyledCard
            {...adminDelete({
                deck,
                role: session?.user?.role || 'USER',
                onDelete: deleteDeck,
                setIsDeleting,
            })}
            hoverable
            loading={isDeleting}
            style={{ maxWidth: 360 }}
            title={
                <TitleContainer>
                    <Text className={'deck-card-title'} ellipsis>
                        {deck.title}
                    </Text>
                </TitleContainer>
            }
        >
            <Meta
                description={
                    <Link legacyBehavior href={`/decks/${deck.id}`} passHref>
                        <Row gutter={[8, 24]}>
                            <Col span={24}>
                                <Statistic
                                    title={'Questions'}
                                    value={deck?._count?.questions || 0}
                                />
                            </Col>
                            <Col span={20}>
                                <TagContainer>
                                    {deck.tags.map((tag, i) => (
                                        <StyledTag key={i}>{tag}</StyledTag>
                                    ))}
                                </TagContainer>
                            </Col>
                        </Row>
                    </Link>
                }
            />
        </StyledCard>
    )
}

export default DeckCard
