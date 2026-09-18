import { Button, Card, Form, Input } from 'antd'
import React from 'react'
import styled from 'styled-components'
const { Item } = Form,
    { TextArea } = Input

export enum EditorTypes {
    REPLY,
    PARENT,
}

interface ICommentEditor {
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    onSubmit: () => void
    submitting: boolean
    value: string
    type: EditorTypes
    showInput: boolean
    setShowInput: React.Dispatch<React.SetStateAction<boolean>>
}

const CommentInput = styled(TextArea)`
    &&& {
        border-radius: 7px;
        max-width: 320px;
    }
`

const CommentEditor = ({
    onChange,
    onSubmit,
    submitting,
    showInput,
    type,
    value,
}: ICommentEditor) => (
    <div style={{ padding: '8px' }}>
        <Card type={'inner'}>
            {((type === EditorTypes.PARENT && showInput) ||
                type === EditorTypes.REPLY) && (
                <Item>
                    <CommentInput rows={4} onChange={onChange} value={value} />
                </Item>
            )}
            <Item>
                <Button
                    htmlType='submit'
                    loading={submitting}
                    onClick={onSubmit}
                    type='primary'
                >
                    Add Comment
                </Button>
            </Item>
        </Card>
    </div>
)

export default CommentEditor
