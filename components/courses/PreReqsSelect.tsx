import { Button, Empty, Select } from 'antd'

import { Course } from '@prisma/client'
import CourseListEmpty from '../learningTracks/CourseListEmpty'
import { CourseTabKeys } from './CourseTabs'
import Link from 'next/link'
import React from 'react'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'

interface IPreReqs {
    value: Array<string>
    onChange: React.Dispatch<React.SetStateAction<Array<string>>>
    isPopover?: boolean
    course?: Course
}

interface SelectOption {
    label: string
    value: string
}

const buildOption = (course: Course) => ({
    label: course.title,
    value: course.id,
})

const PreReqsSelect = ({
    value,
    onChange,
    isPopover = false,
    course,
}: IPreReqs) => {
    const courses = useCoursesSWR({})
    console.log('this is our course', course)

    const options = courses?.reduce<SelectOption[]>((acc, curr) => {
        //if we are editing an existing course's pre-reqs
        if (course) {
            //only show the new courses
            if (!course.preReqs.includes(curr.id) && curr.id !== course.id) {
                return [...acc, buildOption(curr)]
            }
            return acc
        }

        return [...acc, buildOption(curr)]
    }, [])

    return (
        <Select
            {...(isPopover && { style: { width: '300px' } })}
            value={value}
            onChange={key => onChange(key)}
            mode={'multiple'}
            getPopupContainer={el => el.parentNode}
            options={options}
            placeholder={'Pre-Requisites'}
            notFoundContent={
                <Empty description='No Courses - Create one first' />
            }
            filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase()) ||
                false
            }
        />
    )
}

export default PreReqsSelect
