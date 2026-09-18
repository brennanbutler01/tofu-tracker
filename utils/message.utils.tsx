import { message } from 'antd'

export enum Models {
    DECK = 'deck',
    QUESTION = 'question',
    DECK_WITH_QUESTIONS = 'deck',
    OPTIONS = 'option',
    GAME = 'game',
    COMMENT = 'comment',
    FEEDBACK = 'feedback',
    RATING = 'rating',
    RESOURCES = 'resource',
    GRADING_SESSION = 'grading session',
    USERS = 'user',
    COURSES = 'course',
    PRE_REQ = 'pre-requisite course',
    LEARNING_TRACK = 'learning track',
    COURSE_SESSION = 'course session',
    ACTIVITY = 'activity',
    ACTIVITY_SESSION = 'activity session',
}

export enum MessageStatus {
    SUCCESS,
    ERROR,
}

export enum CRUDOperation {
    CREATE = 'CREATED',
    UPDATE = 'UPDATED',
    DELETE = 'DELETED',
}

export interface IMessage {
    model: Models
    status: MessageStatus
    operation: CRUDOperation
}

//this is used for building and configuring messages
export const messageConfig = ({ model, status, operation }: IMessage) => {
    if (status === MessageStatus.SUCCESS) {
        return message.success(`SUCCESS! ${operation} ${model}`)
    } else {
        return message.error(`ERROR! ${operation} UNABLE TO BE ${operation}`)
    }
}
