import { Button, Card, Space, Typography } from 'antd'
import styled from 'styled-components'
import Link from 'next/link'
const { Text, Title } = Typography

const PlayTypeCard = styled(Card)`
        align-items: center;
        display: flex;
        height: 480px;
        justify-content: center;
        &:hover {
            background-color: rgba(50, 50, 62, 0.05);
        }
        width: 100%;
        &&& {
            .ant-card-body {
                height: 100%;
                width: 100%;
            }
            .ant-btn {
                height: 100%;
                width: 100%;
            }
        }
    `,
    PlayText = styled(Text)`
        font-size: 1.5rem;
        white-space: break-spaces;
    `

interface IPlayConfig {
    title: string
    text: string
    link: string
}

type PlayKeys = 'free' | 'structured'

const playConfig: Record<PlayKeys, IPlayConfig> = {
    free: {
        title: 'Free Play',
        text: 'Personalize your learning! Pick your decks and questions to build your own educational adventure',
        link: 'play/free',
    },
    structured: {
        title: 'Structured Play',
        text: 'Follow one of our pre-constructed courses, already tailor-made and intelligently ordered to guarantee results!',
        link: 'play/study',
    },
}

interface IPlayCard {
    playType: PlayKeys
}

const PlayCard = ({ playType }: IPlayCard) => {
    return (
        <Link legacyBehavior href={playConfig[playType].link}>
            <a>
                <PlayTypeCard bordered={false} hoverable>
                    <Button block size={'large'}>
                        <Space style={{ width: '100%' }} direction={'vertical'}>
                            <Title level={2}>
                                {' '}
                                {playConfig[playType].title}{' '}
                            </Title>
                            <PlayText type={'secondary'}>
                                {playConfig[playType].text}
                            </PlayText>
                        </Space>
                    </Button>
                </PlayTypeCard>
            </a>
        </Link>
    )
}
export default PlayCard
