import { Button, Col, Form, Input, Row, Space } from 'antd'
import React, { useEffect, useRef } from 'react'
import { ICommentForm } from '@/components/game/ParentCommentEditor'
import { useFeedbackCRUD } from '@/services/feedback/useFeedbackCRUD'
import { useRouter } from 'next/router'
import { useGamesSWR } from '@/services/games/useGamesSWR'
import { CommentTypes } from '@/components/game/CommentList'

const { Item } = Form,
    { TextArea } = Input

interface IChildEditorProps {
    setReplying: React.Dispatch<React.SetStateAction<boolean>>
    parentId: string
    type: CommentTypes
    resourceId?: string
}

const ChildCommentEditor = ({
    parentId,
    setReplying,
    type,
    resourceId,
}: IChildEditorProps) => {
    const closeEditor = () => setReplying(false)
    const textRef = useRef<HTMLTextAreaElement>(null)
    const {
        query: { id },
    } = useRouter()
    const game = useGamesSWR(id as string)

    const { createQuestionChildComment, createResourceChildComment } =
        useFeedbackCRUD(game.questions[game.currentQuestion - 1].id)

    useEffect(() => {
        //lets us focus the editor as soon as it appears.
        if (textRef?.current) {
            textRef.current.focus()
        }
    }, [textRef])

    return (
        <Form<ICommentForm>
            onFinish={async val => {
                closeEditor()
                type === CommentTypes.QUESTION
                    ? await createQuestionChildComment({ ...val, parentId })
                    : resourceId
                    ? await createResourceChildComment({
                          ...val,
                          parentId,
                          resourceId,
                      })
                    : console.log('please pass a resource Id')
            }}
        >
            <Row>
                <Col span={24} md={20} lg={12}>
                    <Item style={{ marginBottom: 2 }} name={'comment'}>
                        <TextArea ref={textRef} placeholder={'Comment...'} />
                    </Item>
                </Col>
                <Col span={24}>
                    <Item>
                        <Space>
                            <Item noStyle>
                                <Button
                                    size={'small'}
                                    htmlType={'reset'}
                                    danger
                                    onClick={closeEditor}
                                >
                                    Cancel
                                </Button>
                            </Item>
                            <Item noStyle>
                                <Button size={'small'} htmlType={'submit'}>
                                    Submit reply
                                </Button>
                            </Item>
                        </Space>
                    </Item>
                </Col>
            </Row>
        </Form>
    )
}
export default ChildCommentEditor
