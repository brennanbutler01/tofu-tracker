import { Button, Empty } from 'antd'

import { CourseTabKeys } from '../courses/CourseTabs'
import Link from 'next/link'

const CourseListEmpty = () => {
    return (
        <Empty description={'No courses. Click below to create a new one.'}>
            <Button>
                <Link legacyBehavior
                    href={{
                        pathname: '/courses',
                        query: { tab: CourseTabKeys.create },
                    }}
                >
                    <a>Create Course</a>
                </Link>
            </Button>
        </Empty>
    )
}
export default CourseListEmpty
