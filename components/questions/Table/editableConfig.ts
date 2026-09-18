import { QuestionWithOptions } from '@/pages/decks/[id]'
import { useDeckQuestionCRUD } from '@/services/decks/questions/useDeckQuestionCRUD'
import { useState } from 'react'
import { FormInstance } from 'antd'

interface IEditableConfig {
    form: FormInstance
}

export const useEditableConfig = ({ form }: IEditableConfig) => {
    const { updateDeckQuestion } = useDeckQuestionCRUD()
    const [editingKey, setEditingKey] = useState('')
    const isEditing = (record: QuestionWithOptions) => record.id === editingKey

    const edit = (record: QuestionWithOptions) => {
        if (editingKey === record.id) {
            setEditingKey('')
        } else {
            form.setFieldsValue({
                question: record.question,
                type: record.type,
            })
            setEditingKey(record.id)
        }
    }

    const saveEdit = async (record: QuestionWithOptions) => {
        const formValues = { ...form.getFieldsValue(), id: record.id }
        setEditingKey('')
        await updateDeckQuestion(formValues)
    }

    return { isEditing, edit, saveEdit, editingKey }
}
