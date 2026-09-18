import { Button, Col, Form, Grid, Input, Row, Skeleton, Space } from 'antd'
import styled from 'styled-components'
import React, { useRef } from 'react'
import FadeIn from 'react-fade-in'
import { useFeedbackCRUD } from '@/services/feedback/useFeedbackCRUD'
import { CommentTypes } from '@/components/game/CommentList'
import { IResourceItem } from '@/components/game/resources/ResourceItem'

const { Item } = Form,
    { TextArea } = Input

const CommentInput = styled(TextArea)`
    &&& {
        border-radius: 2px;
        max-width: 320px;
    }
`

export interface ICommentForm {
    comment: string
}

interface IParentCommentEditor extends Partial<IResourceItem> {
    question?: string
    inputVisible: boolean
    setInputVisible: React.Dispatch<React.SetStateAction<boolean>>
    listEmpty: boolean
    loading: boolean
    type: CommentTypes
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const ParentCommentEditor = ({
    question,
    inputVisible,
    setInputVisible,
    listEmpty,
    loading,
    type,
    item,
    setLoading,
}: IParentCommentEditor) => {
    const toggleInput = () => setInputVisible(!inputVisible)
    const { createComment, createResourceComment } = useFeedbackCRUD(
        question as string
    )
    const [form] = Form.useForm<ICommentForm>()
    const breakpoint = Grid.useBreakpoint()

    const commentInput = useRef(null)

    console.log(CommentTypes[type])

    return (
        <Form name={'comment'} form={form}>
            <Row gutter={[0, 8]}>
                {inputVisible && (
                    <Col span={24}>
                        <>
                            <Item>
                                <FadeIn>
                                    <Item noStyle name={'comment'}>
                                        <CommentInput
                                            rows={4}
                                            placeholder={'Comment here...'}
                                            ref={commentInput}
                                        />
                                    </Item>
                                </FadeIn>
                            </Item>
                        </>
                    </Col>
                )}
                <Col span={24}>
                    <Space size={'large'}>
                        {inputVisible && (
                            <Button
                                block={breakpoint.xs}
                                onClick={toggleInput}
                                danger
                                type={'ghost'}
                                htmlType={'reset'}
                                loading={loading}
                            >
                                Close
                            </Button>
                        )}
                        {((listEmpty && inputVisible) || !listEmpty) && (
                            <Button
                                block={breakpoint.xs}
                                loading={loading}
                                aria-label={
                                    inputVisible
                                        ? 'Add comment'
                                        : 'Create Comment'
                                }
                                onClick={async () => {
                                    if (!inputVisible) {
                                        setInputVisible(true)
                                    } else {
                                        setLoading(true)
                                        const val = form.getFieldsValue()
                                        const saved =
                                            type === CommentTypes.QUESTION
                                                ? await createComment(val)
                                                : item
                                                ? await createResourceComment({
                                                      ...val,
                                                      resourceId: item.id,
                                                  })
                                                : false
                                        if (saved) {
                                            form.resetFields()
                                            setInputVisible(false)
                                        }
                                        setLoading(false)
                                    }
                                }}
                                type={inputVisible ? 'dashed' : 'ghost'}
                            >
                                {inputVisible ? 'Add' : 'Create Comment'}
                            </Button>
                        )}
                    </Space>
                </Col>
            </Row>
        </Form>
    )
}

export default ParentCommentEditor
