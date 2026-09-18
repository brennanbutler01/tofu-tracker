import { Empty, FormInstance, List } from 'antd'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import React, { useEffect, useState } from 'react'
import CourseOrderItem from '@/components/learningTracks/CourseOrderItem'
import { LearningTrackWithOrderedCourses } from '@/pages/api/learningTracks'
import { useLearningTrackCRUD } from '@/services/learningTrack/useLearningTrackCRUD'
import styled from 'styled-components'

interface ICourseOrder {
    courses: Array<string>
    form: FormInstance
    editingTrack?: LearningTrackWithOrderedCourses
    editingTrackPage?: LearningTrackWithOrderedCourses
}

const EmptyContainer = styled.div`
    .ant-empty-image {
        display: flex;
        justify-content: center;
    }
    .ant-list-item-action-split {
        background-color: ${props => props.theme['tofu-brand-6']};
    }
`

export const reorder = (
    list: Array<string>,
    startIndex: number,
    endIndex: number
) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}

const CourseOrder = ({
    courses,
    form,
    editingTrack,
    editingTrackPage,
}: ICourseOrder) => {
    const [courseOrder, setCourseOrder] = useState<Array<string>>([])
    const { reOrderLearningTrackCourses } = useLearningTrackCRUD()

    useEffect(() => {
        setCourseOrder(courses)
    }, [courses])

    useEffect(() => {
        form.setFieldsValue({ courseOrder: courseOrder })
    }, [courseOrder, form])

    const onDragEnd = async (result: DropResult) => {
        const { destination, source } = result

        if ((destination?.index as number) >= 0) {
            const updatedCourseOrder = reorder(
                courseOrder,
                source.index,
                destination?.index as number
            )
            setCourseOrder(updatedCourseOrder)

            if (editingTrack) {
                await reOrderLearningTrackCourses({
                    trackId: editingTrack.id,
                    courseOrder: updatedCourseOrder,
                })
            }
        }
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={'droppable'}>
                {provided => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{ padding: '12px' }}
                    >
                        <EmptyContainer>
                            <List
                                dataSource={courseOrder}
                                itemLayout={'vertical'}
                                renderItem={(item, index) => (
                                    <CourseOrderItem
                                        key={item}
                                        id={item}
                                        index={index}
                                        courses={courseOrder}
                                        setCourseOrder={setCourseOrder}
                                        editingTrack={editingTrack}
                                        form={form}
                                    />
                                )}
                                locale={{
                                    emptyText: (
                                        <Empty
                                            description={'No Courses Selected'}
                                        />
                                    ),
                                }}
                            />
                        </EmptyContainer>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
export default CourseOrder
