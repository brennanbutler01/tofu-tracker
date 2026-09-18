import { Col, List } from 'antd'

import { Course } from '@prisma/client'
import DeleteItem from '@/components/DeleteItem'
import { Models } from '@/utils/message.utils'
import PreReqListEmpty from '@/components/courses/PreReqListEmpty'
import PreReqPopover from '@/components/courses/PreReqPopover'
import React from 'react'
import { useCoursesCRUD } from '@/services/courses/useCoursesCRUD'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'
const { Item } = List

export interface IPreReqsList {
    course: Course
}

type CardLoading = {
    setCardLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const PreReqsList = ({
    course,
    setCardLoading,
}: IPreReqsList & CardLoading) => {
    const courses = useCoursesSWR({})
    const { deletePreReq } = useCoursesCRUD()

    return (
        <Col span={24}>
            <List
                dataSource={course?.preReqs}
                locale={{
                    emptyText: <PreReqListEmpty course={course} />,
                }}
                loading={!course || !courses}
                {...(course?.preReqs?.length > 0 && {
                    footer: <PreReqPopover course={course} />,
                })}
                renderItem={item => {
                    /* TODO - figure out how i want to handle deleting pre-reqs when courses are deleted & how to handle relationship (should make a model... but don';t want to commit to anything yet).
            Would be fantastic if we could figure out why prisma m-m self relations aren't working... then we could do this more neatly
            */
                    const courseTitle = courses.find(c => c.id === item)?.title
                    return courseTitle ? (
                        <Item
                            key={item}
                            actions={[
                                <DeleteItem
                                    key={'delete'}
                                    onDelete={async () => {
                                        setCardLoading(true)
                                        await deletePreReq({
                                            preReqId: item,
                                            courseId: course.id,
                                        })
                                        setCardLoading(false)
                                    }}
                                    model={Models.PRE_REQ}
                                />,
                            ]}
                        >
                            {courseTitle}
                        </Item>
                    ) : null
                }}
            />
        </Col>
    )
}

export default PreReqsList
