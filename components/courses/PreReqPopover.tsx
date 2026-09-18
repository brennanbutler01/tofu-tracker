import FormLabel from '@/components/FormLabel'
import PreReqsSelect from '@/components/courses/PreReqsSelect'
import { Button, Form, Popover } from 'antd'
import React, { useState } from 'react'
import { IPreReqsList } from '@/components/courses/PreReqsList'
import { useCoursesCRUD } from '@/services/courses/useCoursesCRUD'
import styled from 'styled-components'
import { SelectContainer } from '@/decks/DeckCategories'
const { Item } = Form

export const PopoverContainer = styled(SelectContainer)`
    .ant-popover-title {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-5']};
    }
`
interface PreReqForm {
    preReqs: Array<string>
}

const PreReqPopover = ({ course }: IPreReqsList) => {
    const [preReqs, setPreReqs] = useState<Array<string>>([])
    const [form] = Form.useForm<PreReqForm>()
    const { addPreReq } = useCoursesCRUD()
    return (
        <PopoverContainer>
            <Popover
                getPopupContainer={el => el.parentNode as HTMLElement}
                title={'Select Course(s)'}
                content={
                    <Form<PreReqForm>
                        layout={'vertical'}
                        name={'pre-req-form'}
                        form={form}
                        onFinish={async val => {
                            await addPreReq({
                                preReqIds: val.preReqs,
                                courseId: course.id,
                            })
                            form.resetFields()
                        }}
                    >
                        <Item label={<FormLabel label={'Pre-Reqs'} />}>
                            <Item noStyle name={'preReqs'}>
                                <PreReqsSelect
                                    value={preReqs}
                                    onChange={setPreReqs}
                                    isPopover
                                    course={course}
                                />
                            </Item>
                        </Item>
                        <Item>
                            <Button htmlType={'submit'} form={'pre-req-form'}>
                                Confirm
                            </Button>
                        </Item>
                    </Form>
                }
            >
                <Button>Add Pre-Req</Button>
            </Popover>
        </PopoverContainer>
    )
}

export default PreReqPopover
