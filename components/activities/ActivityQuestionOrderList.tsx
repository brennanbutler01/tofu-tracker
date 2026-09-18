import { useQuestionSWR } from '@/services/questions/useQuestionSWR'
import { Question } from '@prisma/client'
import { Empty, FormInstance, List } from 'antd'
import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { reorder } from '../learningTracks/CourseOrder'
import { IActivityForm } from './ActivityForm'
import QuestionOrderItem from './QuestionOrderItem'

interface IActivityQuestionOrderList {
    filteredQuestions: Array<Question>
    form: FormInstance<IActivityForm>
}

const ActivityQuestionOrderList = ({
    filteredQuestions,
    form,
}: IActivityQuestionOrderList) => {
    const [orderedQuestions, setOrderedQuestions] = useState<Array<string>>([])
    const swrQuestions = useQuestionSWR()

    useEffect(() => {
        form.setFieldsValue({ questionOrder: orderedQuestions })
    }, [orderedQuestions, form])

    useEffect(() => {
        setOrderedQuestions(filteredQuestions?.map(q => q.id))
    }, [filteredQuestions])

    const dropItem = (result: DropResult) => {
        console.log('dropped', result)
        const { destination, source } = result

        if ((destination?.index as number) >= 0) {
            const updatedOrder = reorder(
                orderedQuestions,
                source.index,
                destination?.index as number
            )

            console.log(orderedQuestions, updatedOrder)
            setOrderedQuestions(updatedOrder)
        }
    }

    return (
        <DragDropContext onDragEnd={dropItem}>
            <Droppable droppableId='questionOrder'>
                {provided => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        <List
                            locale={{
                                emptyText: (
                                    <Empty description='No Questions selected' />
                                ),
                            }}
                            dataSource={orderedQuestions?.map(
                                q =>
                                    swrQuestions?.find(
                                        sQ => sQ.id === q
                                    ) as Question
                            )}
                            renderItem={(q, i) => (
                                <QuestionOrderItem index={i} question={q} />
                            )}
                        />
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export default ActivityQuestionOrderList
