import { useUserFeedbackCRUD } from '@/services/userFeedback/useUserFeedbackCRUD'
import { FeedbackSeverity, FeedbackType } from '@prisma/client'
import { Button, Form, Input, Select, Space } from 'antd'
import { SelectContainer } from '../decks/DeckCategories'
import FormLabel from '../FormLabel'
const { Item } = Form,
    { TextArea } = Input

export interface IFeedbackForm {
    subject: string
    suggestion: string
    type: FeedbackType
    severity: FeedbackSeverity
}

interface IUserFeedback {
    closeDrawer: () => void
}

const FeedbackForm = ({ closeDrawer }: IUserFeedback) => {
    const [form] = Form.useForm<IFeedbackForm>()
    const { createFeedback } = useUserFeedbackCRUD()
    return (
        <Form
            form={form}
            layout='vertical'
            onFinish={async val => await createFeedback(val)}
        >
            <SelectContainer>
                <Item name={'type'} label={<FormLabel label='Feedback Type' />}>
                    <Select
                        placeholder='Feedback Type'
                        options={Object.values(FeedbackType).map(type => ({
                            key: type,
                            value: type,
                            label: type,
                        }))}
                        getPopupContainer={el => el.parentNode as HTMLElement}
                    />
                </Item>
                <Item
                    name='severity'
                    label={<FormLabel label='Feedback Severity' />}
                >
                    <Select
                        placeholder='Feedback severity'
                        options={Object.values(FeedbackSeverity).map(
                            severity => ({
                                key: severity,
                                label: severity,
                                value: severity,
                            })
                        )}
                        getPopupContainer={el => el.parentNode as HTMLElement}
                    />
                </Item>
            </SelectContainer>
            <Item name='subject' label={<FormLabel label='Subject' />}>
                <Input placeholder='Subject' />
            </Item>
            <Item name='suggestion' label={<FormLabel label='Suggestion' />}>
                <TextArea placeholder='Suggestion' />
            </Item>
            <Space>
                <Item>
                    <Button type='primary' htmlType='submit'>
                        Submit
                    </Button>
                </Item>
                <Item>
                    <Button danger htmlType='reset' onClick={closeDrawer}>
                        Cancel
                    </Button>
                </Item>
            </Space>
        </Form>
    )
}

export default FeedbackForm
