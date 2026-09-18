import { Question } from '@prisma/client'
import { List } from 'antd'
import { Draggable } from 'react-beautiful-dnd'
const { Item } = List

interface IQuestionOrderItem {
    question: Question
    index: number
}

const QuestionOrderItem = ({ question, index }: IQuestionOrderItem) => {
    return (
        <Draggable key={question.id} draggableId={question.id} index={index}>
            {provided => (
                <div
                    ref={provided.innerRef}
                    {...provided.dragHandleProps}
                    {...provided.draggableProps}
                >
                    <Item key={question.id}>{question.question}</Item>
                </div>
            )}
        </Draggable>
    )
}

export default QuestionOrderItem
