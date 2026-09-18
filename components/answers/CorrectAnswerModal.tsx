import { Button, Modal, Space } from 'antd'
import { IQuestionForm } from '@/questions/QuestionForm'
import React from 'react'
import AnswerForm, {
    CORRECT_ANSWER_FORM,
} from '@/components/answers/CorrectAnswerForm'

interface IAnswerModal {
    editing?: string
    onClose: () => void
    val: IQuestionForm
    visible: boolean
}

const CorrectAnswerModal = ({
    val,
    onClose,
    visible,
    editing,
}: IAnswerModal) => {
    return (
        <Modal
            destroyOnClose
            closable={false}
            title={'Correct answer?'}
            onCancel={onClose}
            visible={visible}
            footer={
                <Space>
                    <Button
                        htmlType={'reset'}
                        form={CORRECT_ANSWER_FORM}
                        danger
                        type={'ghost'}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        htmlType={'submit'}
                        form={CORRECT_ANSWER_FORM}
                        type={'primary'}
                    >
                        Confirm
                    </Button>
                </Space>
            }
        >
            {visible && (
                <AnswerForm values={val} editing={editing} onClose={onClose} />
            )}
        </Modal>
    )
}
export default CorrectAnswerModal
