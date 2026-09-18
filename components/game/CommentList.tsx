import { Button, Empty, List } from 'antd'
import {
    FullQuestionComment,
    FullResourceComment,
} from '@/services/feedback/useFeedbackSWR'
import CommentItem from '@/components/game/CommentItem'
import React, { useState } from 'react'
import ParentCommentEditor from '@/components/game/ParentCommentEditor'
import { IGameCardTabs } from '@/components/game/GameCardTabs'
import { IResourceItem } from '@/components/game/resources/ResourceItem'

export enum CommentTypes {
    QUESTION,
    RESOURCE,
}

type ExtraCommentProps = IGameCardTabs & Partial<IResourceItem>

interface ICommentList extends ExtraCommentProps {
    comments: Array<FullQuestionComment | FullResourceComment>
    type: CommentTypes
}
const CommentList = ({
    comments,
    type,
    feedbackQuestionId,
    item,
}: ICommentList) => {
    const [loading, setLoading] = useState(false)
    const [inputVisible, setInputVisible] = useState(false)
    return (
        <List
            locale={{
                emptyText: (
                    <Empty description={'No Comments'}>
                        <Button onClick={() => setInputVisible(true)}>
                            Create Comment
                        </Button>
                    </Empty>
                ),
            }}
            loading={loading}
            //get our top level comments only
            dataSource={comments?.filter(c => !c.parentComment)}
            renderItem={item => (
                <CommentItem
                    questionId={feedbackQuestionId}
                    comment={item}
                    type={type}
                />
            )}
            footer={
                <ParentCommentEditor
                    type={type}
                    question={feedbackQuestionId}
                    inputVisible={inputVisible}
                    setInputVisible={setInputVisible}
                    listEmpty={comments?.length === 0}
                    loading={loading}
                    setLoading={setLoading}
                    item={item}
                />
            }
        />
    )
}

export default CommentList
