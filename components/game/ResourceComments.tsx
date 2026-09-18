import { Col, Row, Space, Typography } from 'antd'
import CommentList, { CommentTypes } from '@/components/game/CommentList'
import ParentCommentEditor from '@/components/game/ParentCommentEditor'
import { IResourceItem } from '@/components/game/resources/ResourceItem'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useGamesSWR } from '@/services/games/useGamesSWR'
import styled from 'styled-components'
const { Text } = Typography
const ResourceCommentTitle = styled(Text)`
    font-size: 1.05rem;
    color: ${props => props.theme['tofu-text-heading']};
`
const ResourceComments = ({ item }: IResourceItem) => {
    const [loading, setLoading] = useState(false)
    const [inputVisible, setInputVisible] = useState(false)
    const {
        query: { id },
    } = useRouter()
    const game = useGamesSWR(id as string)
    console.log('resource item', item)
    return (
        <Row style={{ marginTop: '10px' }}>
            <Col span={24}>
                <ResourceCommentTitle>
                    Comments for {item.title}
                </ResourceCommentTitle>
            </Col>
            <Col span={24}>
                <CommentList
                    comments={item.comments}
                    type={CommentTypes.RESOURCE}
                    feedbackQuestionId={
                        game?.questions[game?.currentQuestion - 1]?.id
                    }
                    item={item}
                />
            </Col>
        </Row>
    )
}

export default ResourceComments
