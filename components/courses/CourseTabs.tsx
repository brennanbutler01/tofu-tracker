import { useEffect, useState } from 'react'

import CourseForm from '@/components/courses/CourseForm'
import CourseList from '@/components/courses/CourseList'
import { Tabs } from 'antd'
import { useRouter } from 'next/router'

const { TabPane } = Tabs

export enum CourseTabKeys {
    'view' = 'view',
    'create' = 'create',
}

const CourseTabs = () => {
    const [courseTab, setCourseTab] = useState<CourseTabKeys>(
        CourseTabKeys.view
    )
    const router = useRouter()

    useEffect(() => {
        if (router.query.tab === CourseTabKeys.create) {
            //then we navigated here from clicking on a 'create course' button
            setCourseTab(CourseTabKeys.create)
            // move to the create tab and then fix the history
            router.push('/courses')
        }
    }, [router.query, router])

    return (
        <Tabs
            activeKey={courseTab}
            onChange={k => setCourseTab(k as CourseTabKeys)}
        >
            <TabPane key={'view'} tab={'View Courses'}>
                <CourseList setCourseTab={setCourseTab} />
            </TabPane>
            <TabPane key={'create'} tab={'Create Courses'}>
                <div style={{ marginTop: '15px' }}>
                    <CourseForm setCourseTab={setCourseTab} />
                </div>
            </TabPane>
        </Tabs>
    )
}

export default CourseTabs
