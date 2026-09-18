import { Button, Comment, List } from 'antd'
import { useState } from 'react'
import {
    FullQuestionComment,
    FullResourceComment,
    useFeedbackSWR,
} from '@/services/feedback/useFeedbackSWR'
import { useFeedbackCRUD } from '@/services/feedback/useFeedbackCRUD'
import { useRouter } from 'next/router'
import { useGamesSWR } from '@/services/games/useGamesSWR'
import ChildCommentEditor from '@/components/game/ChildCommentEditor'
import FadeIn from 'react-fade-in'
import AvatarWithFallback from '@/components/game/AvatarWithFallback'
import { useLikes } from '@/utils/useLikes'
import { CommentTypes } from '@/components/game/CommentList'
import TimestampTag from '../TimestampTag'

interface ICommentItem {
    comment: FullQuestionComment | FullResourceComment
    type: CommentTypes
}

const CommentItem = ({ comment, type }: ICommentItem) => {
    const [replying, setReplying] = useState(false)
    const {
        query: { id },
    } = useRouter()
    const game = useGamesSWR(id as string)
    const { likeDislikeQuestionComment, likeDislikeResourceComment } =
        useFeedbackCRUD(game?.questions?.[game?.currentQuestion - 1]?.id)

    const feedback = useFeedbackSWR(
        game?.questions?.[game?.currentQuestion - 1]?.id
    )

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
            author={comment.user?.name || 'Brennan'}
            avatar={<AvatarWithFallback user={comment?.user} />}
            datetime={<TimestampTag date={comment.created} />}
        >
            {replying && (
                <FadeIn>
                    <ChildCommentEditor
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
            {/* recursively stepping through our children comments */}
            {comment.childrenComments?.length > 0 && (
                <List
                    dataSource={comment.childrenComments}
                    renderItem={item => (
                        <CommentItem
                            comment={
                                type === CommentTypes.QUESTION
                                    ? (feedback.comments.find(
                                          c => c.id === item
                                      ) as FullQuestionComment)
                                    : (feedback?.resources
                                          ?.find(
                                              r =>
                                                  r.id ===
                                                  (
                                                      comment as FullResourceComment
                                                  ).resourceId
                                          )
                                          ?.comments?.find(
                                              c => c.id === item
                                          ) as FullResourceComment)
                            }
                            type={type}
                        />
                    )}
                />
            )}
        </Comment>
    )
}

export default CommentItem
