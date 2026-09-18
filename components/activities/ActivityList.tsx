import { ActivityWithQuestion } from '@/pages/api/activities'
import { useActivitySWR } from '@/services/activities/useActivitySWR'
import { Button, Empty, List } from 'antd'
import React, { useEffect, useState } from 'react'

import ActivityListItem from './ActivityListItem'
import { ActivityTabKeys } from './ActivityTabs'

interface IActivityList {
    setActivityTab: React.Dispatch<React.SetStateAction<ActivityTabKeys>>
}

const ActivityList = ({ setActivityTab }: IActivityList) => {
    const activities = useActivitySWR({})
    const [filteredActivities, setFilteredActivities] = useState<
        Array<ActivityWithQuestion>
    >([])
    const [loading, setLoading] = useState(false)

    console.log('activities', activities)

    useEffect(() => {
        setFilteredActivities(activities)
    }, [activities])

    return (
        <List
            dataSource={filteredActivities}
            loading={loading || !activities}
            locale={{
                emptyText: (
                    <Empty description='No Activities'>
                        <Button
                            onClick={() =>
                                setActivityTab(ActivityTabKeys.CREATE)
                            }
                        >
                            Add Activity
                        </Button>
                    </Empty>
                ),
            }}
            renderItem={activity => (
                <ActivityListItem activity={activity} setLoading={setLoading} />
            )}
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 4, xxl: 5 }}
        />
    )
}

export default ActivityList
