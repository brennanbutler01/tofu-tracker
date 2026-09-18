import { Empty } from 'antd'
import React from 'react'
import { IPreReqsList } from '@/components/courses/PreReqsList'
import PreReqPopover from '@/components/courses/PreReqPopover'

const PreReqListEmpty = ({ course }: IPreReqsList) => {
    return (
        <Empty description={'No Pre-Requisites for this course'}>
            <PreReqPopover course={course} />
        </Empty>
    )
}

export default PreReqListEmpty
