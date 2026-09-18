import { Button, Form, Popover } from 'antd'
import FormLabel from '@/components/FormLabel'
import CourseDecksSelect from '@/components/courses/CourseDecksSelect'
import { PopoverContainer } from '@/components/courses/PreReqPopover'
import React, { useState } from 'react'
import { useCoursesCRUD } from '@/services/courses/useCoursesCRUD'
import { CourseWithDecks } from '@/pages/api/courses'
const { Item } = Form

interface IDecks {
    decks: Array<string>
}

interface ICourseDeckPopover {
    course: CourseWithDecks
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const CourseDeckPopover = ({ course, setLoading }: ICourseDeckPopover) => {
    const [value, setValue] = useState<Array<string>>([])
    const changeValue = (val: Array<string>) => setValue(val)
    const [form] = Form.useForm<IDecks>()
    const { addCourseDeck } = useCoursesCRUD()

    return (
        <PopoverContainer>
            <Popover
                title={'Add Deck'}
                getPopupContainer={el => el.parentNode as HTMLElement}
                content={
                    <Form<IDecks>
                        layout={'vertical'}
                        form={form}
                        onFinish={async val => {
                            setLoading(true)
                            await addCourseDeck({
                                courseId: course.id,
                                deckIdsToAdd: val.decks,
                            })
                            setLoading(false)
                        }}
                    >
                        <Item
                            name={'decks'}
                            label={<FormLabel label={'Decks'} />}
                        >
                            <CourseDecksSelect
                                value={value}
                                onChange={changeValue}
                                isPopover
                                course={course}
                            />
                        </Item>
                        <Item>
                            <Button htmlType={'submit'}>Add</Button>
                        </Item>
                    </Form>
                }
            >
                <Button>Add a Deck</Button>
            </Popover>
        </PopoverContainer>
    )
}

export default CourseDeckPopover
