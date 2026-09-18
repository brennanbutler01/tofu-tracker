import React, { useEffect, useState } from 'react'
import { useGradeAnswersSWR } from '@/services/toGrade/useGradeAnswersSWR'
import { useGradingSessionCRUD } from '@/services/gradingSession/useGradingSessionCRUD'
import { useRouter } from 'next/router'

export const useAnswerListSelect = () => {
    const answersToGrade = useGradeAnswersSWR({})
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])
    const [indeterminate, setIndeterminate] = useState(false)
    const [checkAll, setCheckAll] = useState(false)
    const [loading, setLoading] = useState(false)
    const { createGradingSession } = useGradingSessionCRUD()
    const { push } = useRouter()

    useEffect(() => {
        if (selectedKeys?.length === 0) {
            if (indeterminate) {
                setIndeterminate(false)
            }
            if (checkAll) {
                setCheckAll(false)
            }
        } else if (
            selectedKeys?.length > 0 &&
            selectedKeys?.length !== answersToGrade?.length
        ) {
            if (!indeterminate) {
                setIndeterminate(true)
            }
            if (checkAll) {
                setCheckAll(false)
            }
        } else {
            if (indeterminate) {
                setIndeterminate(false)
            }
            if (!checkAll) {
                setCheckAll(true)
            }
        }
    }, [answersToGrade, selectedKeys, indeterminate, checkAll])

    const selectKey = (key: string) => {
        if (selectedKeys.includes(key)) {
            setSelectedKeys(selectedKeys.filter(k => k !== key))
        } else {
            const allKeys = [...selectedKeys, key]
            setSelectedKeys(allKeys)
        }
    }

    const startGrading = async () => {
        setLoading(true)
        const id = await createGradingSession({
            answersToGrade: selectedKeys.map(el => el.toString()),
        })
        if (id) await push(`/admin/grade/${id}`)
        setLoading(false)
    }

    //go through all of our answers and add them to the selected.
    const selectAllKeys = () => {
        setSelectedKeys(
            checkAll
                ? []
                : answersToGrade?.reduce(
                      (acc, curr) => [...acc, curr.id],
                      [] as React.Key[]
                  )
        )
    }

    return {
        selectKey,
        startGrading,
        selectAllKeys,
        indeterminate,
        checkAll,
        selectedKeys,
        loading,
    }
}
