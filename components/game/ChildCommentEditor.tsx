import { Button, Col, Form, Input, Row, Space } from 'antd'
import React, { useEffect, useRef } from 'react'
import { ICommentForm } from '@/components/game/ParentCommentEditor'
import { useFeedbackCRUD } from '@/services/feedback/useFeedbackCRUD'
import { CommentTypes } from '@/components/game/CommentList'

const { Item } = Form,
    { TextArea } = Input

interface IChildEditorProps {
    setReplying: React.Dispatch<React.SetStateAction<boolean>>
    parentId: string
    questionId: string
    type: CommentTypes
    resourceId?: string
}

const ChildCommentEditor = ({
    parentId,
    questionId,
    setReplying,
    type,
    resourceId,
}: IChildEditorProps) => {
    const closeEditor = () => setReplying(false)
    const textRef = useRef<HTMLTextAreaElement>(null)
    const { createQuestionChildComment, createResourceChildComment } =
        useFeedbackCRUD(questionId)

    useEffect(() => {
        //lets us focus the editor as soon as it appears.
        if (textRef?.current) {
            textRef.current.focus()
        }
    }, [textRef])

    return (
        <Form<ICommentForm>
            onFinish={async val => {
                const saved =
                    type === CommentTypes.QUESTION
                        ? await createQuestionChildComment({ ...val, parentId })
                        : resourceId
                        ? await createResourceChildComment({
                              ...val,
                              parentId,
                              resourceId,
                          })
                        : false
                if (saved) closeEditor()
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
