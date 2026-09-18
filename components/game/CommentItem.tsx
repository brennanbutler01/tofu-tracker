import { Button, Comment, List } from 'antd'
import { useState } from 'react'
import {
    FullQuestionComment,
    FullResourceComment,
    useFeedbackSWR,
} from '@/services/feedback/useFeedbackSWR'
import { useFeedbackCRUD } from '@/services/feedback/useFeedbackCRUD'
import ChildCommentEditor from '@/components/game/ChildCommentEditor'
import FadeIn from 'react-fade-in'
import AvatarWithFallback from '@/components/game/AvatarWithFallback'
import { useLikes } from '@/utils/useLikes'
import { CommentTypes } from '@/components/game/CommentList'
import TimestampTag from '../TimestampTag'

interface ICommentItem {
    comment: FullQuestionComment | FullResourceComment
    type: CommentTypes
    questionId: string
}

const CommentItem = ({ comment, type, questionId }: ICommentItem) => {
    const [replying, setReplying] = useState(false)
    const { likeDislikeQuestionComment, likeDislikeResourceComment } =
        useFeedbackCRUD(questionId)
    const feedback = useFeedbackSWR(questionId)
    const children =
        (type === CommentTypes.QUESTION
            ? feedback?.comments
            : feedback?.resources.find(
                  resource =>
                      'resourceId' in comment &&
                      resource.id === comment.resourceId
              )?.comments
        )?.filter(child => comment.childrenComments.includes(child.id)) ?? []

    const { actions: likeActions } = useLikes({
        source: comment,
        likeFunction:
            type === CommentTypes.QUESTION
                ? likeDislikeQuestionComment
                : likeDislikeResourceComment,
    })

    const actions = [
        ...likeActions,
        // ...(session?.user?.role === Roles.ADMIN
        //   ? [
        //       <DeleteItem
        //         key={"delete"}
        //         onDelete={async () => await console.log("deleting")}
        //         model={Models.COMMENT}
        //       />,
        //     ]
        //   : []),
        <Button key={'reply'} type={'text'} onClick={() => setReplying(true)}>
            Reply to
        </Button>,
    ]

    return (
        <Comment
            actions={actions}
            content={comment.comment}
            author={comment.user?.name || 'Learner'}
            avatar={<AvatarWithFallback user={comment?.user} />}
            datetime={<TimestampTag date={comment.created} />}
        >
            {replying && (
                <FadeIn>
                    <ChildCommentEditor
                        questionId={questionId}
                        type={type}
                        setReplying={setReplying}
                        parentId={comment.id}
                        {...(type === CommentTypes.RESOURCE &&
                            'resourceId' in comment && {
                                resourceId: comment.resourceId,
                            })}
                    />
                </FadeIn>
            )}
            {children.length > 0 && (
                <List
                    dataSource={children}
                    renderItem={child => (
                        <CommentItem
                            comment={child}
                            type={type}
                            questionId={questionId}
                        />
                    )}
                />
            )}
        </Comment>
    )
}

export default CommentItem
