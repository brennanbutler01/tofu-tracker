import type { IUserAnswersByDay } from '@/pages/api/metrics/answersByDay/[user]'
import AnswersByDayChart from '@/components/metrics/AnswersByDay/AnswersByDayChart'
import { SelectContainer } from '@/decks/DeckCategories'
import { Select, Space, Spin } from 'antd'
import { http } from '@/services/http'
import React, { useState } from 'react'
import { useUsersSWR } from '@/services/users/useUsersSWR'

const AnswersByDay = () => {
    const [data, setData] = useState<IUserAnswersByDay[]>([])
    const users = useUsersSWR()
    const [loading, setLoading] = useState(false)
    const [selectValue, setSelectValue] = useState<string | undefined>()

    return (
        <Space direction={'vertical'} style={{ height: '50vh' }}>
            {loading ? (
                <Spin tip={`Fetching user's data`} />
            ) : (
                <>
                    <SelectContainer>
                        <Select
                            getPopupContainer={el =>
                                el.parentNode as HTMLElement
                            }
                            options={users?.map(u => ({
                                label: u.email,
                                value: u.id,
                            }))}
                            value={selectValue}
                            placeholder={'Select a user'}
                            dropdownStyle={{ minWidth: '200px' }}
                            onSelect={async (val: string) => {
                                setSelectValue(val)
                                setLoading(true)
                                const data = await http
                                    .get<IUserAnswersByDay[]>(
                                        `/metrics/answersByDay/${encodeURIComponent(
                                            val
                                        )}`
                                    )
                                    .then(res => res.data)
                                setLoading(false)
                                setData(data)
                            }}
                        />
                    </SelectContainer>
                    <AnswersByDayChart data={data} />
                </>
            )}
        </Space>
    )
}
export default AnswersByDay
