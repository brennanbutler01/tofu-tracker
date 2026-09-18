import { FormInstance, List, Select } from 'antd'
import { Draggable } from 'react-beautiful-dnd'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'
import { SelectContainer } from '@/decks/DeckCategories'
import React, { useEffect, useState } from 'react'
import { reorder } from '@/components/learningTracks/CourseOrder'
import { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'
import DeleteItem from '@/components/DeleteItem'
import { Models } from '@/utils/message.utils'
import { useLearningTrackCRUD } from '@/services/learningTrack/useLearningTrackCRUD'
import { ITrackForm } from '@/components/learningTracks/TrackForm'

const {
    Item,
    Item: { Meta },
} = List

interface ICourseOrderItem {
    courses: Array<string>
    id: string
    index: number
    setCourseOrder: React.Dispatch<React.SetStateAction<Array<string>>>
    editingTrack?: LearningTrackWithOrderedCourses
    form: FormInstance<ITrackForm>
}

const CourseOrderItem = ({
    id,
    index,
    courses,
    setCourseOrder,
    editingTrack,
    form,
}: ICourseOrderItem) => {
    const ourCourses = useCoursesSWR({})
    const [value, setValue] = useState(-1)
    const { deleteCourse } = useLearningTrackCRUD()

    useEffect(() => {
        setValue(index)
    }, [index])

    const reOrderItem = (key: number) => {
        setCourseOrder(reorder(courses, index, key))
        setValue(key)
    }

    return (
        <Draggable key={id} draggableId={id.toString()} index={index}>
            {provided => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Item
                        key={id}
                        actions={[
                            <SelectContainer key={'index'}>
                                <Select
                                    size={'small'}
                                    getPopupContainer={el => el.parentNode}
                                    options={courses.map((c, i) => ({
                                        label: i + 1,
                                        value: i,
                                    }))}
                                    value={value}
                                    onChange={reOrderItem}
                                />
                            </SelectContainer>,
                            <DeleteItem
                                key={'delete'}
                                onDelete={async () => {
                                    if (editingTrack) {
                                        await deleteCourse({
                                            trackId: editingTrack.id,
                                            courseId: id,
                                        })
                                    } else {
                                        form.setFieldsValue({
                                            courses: courses.filter(
                                                courseId => courseId !== id
                                            ),
                                        })
                                    }
                                }}
                                model={Models.LEARNING_TRACK}
                            />,
                        ]}
                    >
                        <Meta
                            description={
                                ourCourses?.find(course => course.id === id)
                                    ?.title
                            }
                        />
                    </Item>
                </div>
            )}
        </Draggable>
    )
}
export default CourseOrderItem
