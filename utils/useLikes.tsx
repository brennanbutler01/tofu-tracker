import { Space, Tooltip } from 'antd'
import {
    DislikeFilled,
    DislikeOutlined,
    LikeFilled,
    LikeOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { LikeActions } from '@/services/feedback/useFeedbackCRUD'
import styled from 'styled-components'

type LikeDislike = 'liked' | 'disliked' | null

export type LikeKeys = 'likes' | 'dislikes'

export type LikeRecord = Record<LikeKeys, Array<string>>

export interface LikeType<T extends LikeRecord> {
    type: LikeActions
    record: T
    userId?: string
}

interface ILikes {
    source: LikeRecord
    likeFunction?: (props: LikeType<any>) => Promise<void>
}

export const HoverSpan = styled.span`
    &:hover {
        cursor: pointer;
    }
`

export const useLikes = ({ source, likeFunction }: ILikes) => {
    const [action, setAction] = useState<LikeDislike>(null)

    const { data: session } = useSession()

    const like = async () => {
        if (likeFunction) {
            await likeFunction({
                type: LikeActions.LIKE,
                record: source,
            })
        }
    }

    const dislike = async () => {
        if (likeFunction) {
            await likeFunction({
                type: LikeActions.DISLIKE,
                record: source,
            })
        }
    }

    useEffect(() => {
        if (source?.likes?.includes(session?.user?.userId as string)) {
            setAction('liked')
        } else if (
            source?.dislikes?.includes(session?.user?.userId as string)
        ) {
            setAction('disliked')
        }
    }, [session?.user?.userId, source])

    const actions = [
        <Space key={'likesDislikes'}>
            <Tooltip key={'like'} title='Like'>
                <Space onClick={async () => await like()}>
                    <HoverSpan>
                        {action === 'liked' ? <LikeFilled /> : <LikeOutlined />}
                    </HoverSpan>
                    <span>{source?.likes?.length || 0}</span>
                </Space>
            </Tooltip>
            <Tooltip key={'dislike'} title='Dislike'>
                <Space onClick={dislike}>
                    <HoverSpan>
                        {action === 'disliked' ? (
                            <DislikeFilled />
                        ) : (
                            <DislikeOutlined />
                        )}
                    </HoverSpan>
                    <span>{source?.dislikes?.length || 0}</span>
                </Space>
            </Tooltip>
        </Space>,
    ]

    return { actions }
}
