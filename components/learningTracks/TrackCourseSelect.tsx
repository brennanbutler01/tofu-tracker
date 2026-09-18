import CourseListEmpty from './CourseListEmpty'
import { Select } from 'antd'
import { useCoursesSWR } from '@/services/courses/useCoursesSWR'

interface ICourseSelect {
    value: Array<string>
    onChange: React.Dispatch<React.SetStateAction<Array<string>>>
}

const TrackCourseSelect = ({ onChange, value }: ICourseSelect) => {
    const courses = useCoursesSWR({})

    return (
        <Select
            value={value}
            onChange={onChange}
            getPopupContainer={el => el.parentNode as HTMLElement}
            mode={'multiple'}
            options={courses?.map(c => ({
                label: c.title,
                value: c.id,
            }))}
            placeholder={'Select Courses'}
            notFoundContent={<CourseListEmpty />}
            filterOption={(input, option) =>
                option?.label?.toLowerCase()?.includes(input?.toLowerCase()) ||
                false
            }
        />
    )
}

export default TrackCourseSelect
