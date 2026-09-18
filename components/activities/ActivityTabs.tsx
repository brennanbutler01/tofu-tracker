import { Col, Row, Tabs } from 'antd'
import { useState } from 'react'
import styled from 'styled-components'
import ActivityForm from './ActivityForm'
import ActivityList from './ActivityList'

const { TabPane } = Tabs

const StyledPane = styled(TabPane)`
    margin-top: 15px;
`

export enum ActivityTabKeys {
    VIEW = 'view',
    CREATE = 'create',
}

const ActivityTabs = () => {
    const [activityTab, setActivityTab] = useState(ActivityTabKeys.VIEW)
    return (
        <Tabs
            activeKey={activityTab}
            onChange={tab => setActivityTab(tab as ActivityTabKeys)}
        >
            <StyledPane key={ActivityTabKeys.VIEW} tab={'View Activities'}>
                <ActivityList setActivityTab={setActivityTab} />
            </StyledPane>
            <StyledPane key={ActivityTabKeys.CREATE} tab={'Create Activity'}>
                <Row justify='center'>
                    <Col span={24} md={20} lg={16} xxl={12}>
                        <ActivityForm />
                    </Col>
                </Row>
            </StyledPane>
        </Tabs>
    )
}
export default ActivityTabs
