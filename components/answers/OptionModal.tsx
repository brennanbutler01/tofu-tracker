import { Button, Form, Modal, Space } from 'antd'
import React from 'react'
import MultipleOptionsForm from '@/questions/MultipleOptionsForm'
import styled from 'styled-components'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import { OptionsFormValue } from '@/questions/QuestionForm'
import { useDeckQuestionCRUD } from '@/services/decks/questions/useDeckQuestionCRUD'

interface IOptionModal {
    onClose: () => void
    question: QuestionWithOptions
    visible: boolean
}

const OPTION_FORM = 'OptionForm'

const OptionsFormWrapper = styled.div`
    &&& {
        .ant-space {
            justify-content: center;
        }
    }
`

const OptionModal: React.FC<IOptionModal> = ({
    onClose,
    question,
    visible,
}) => {
    const [form] = Form.useForm()
    const { createDeckQuestionOptions } = useDeckQuestionCRUD()

    return (
        <Modal
            destroyOnClose
            closable={false}
            visible={visible}
            title={'Create Options'}
            onCancel={onClose}
            footer={
                <Space>
                    <Button
                        onClick={onClose}
                        htmlType={'reset'}
                        form={OPTION_FORM}
                        danger
                    >
                        Cancel
                    </Button>
                    <Button
                        htmlType={'submit'}
                        type={'primary'}
                        form={OPTION_FORM}
                    >
                        Create
                    </Button>
                </Space>
            }
        >
            <Form<OptionsFormValue>
                form={form}
                name={OPTION_FORM}
                layout={'vertical'}
                onFinish={async values => {
                    const { options } = values
                    const saved = await createDeckQuestionOptions({
                        questionId: question.id,
                        options,
                    })
                    if (saved) onClose()
                }}
            >
                <OptionsFormWrapper>
                    <MultipleOptionsForm editing={question.question} />
                </OptionsFormWrapper>
            </Form>
        </Modal>
    )
}
export default OptionModal
