import React, { useState } from 'react'

import { Tabs } from 'antd'
import TrackForm from '@/components/learningTracks/TrackForm'
import TrackList from '@/components/learningTracks/TrackList'
import styled from 'styled-components'

const { TabPane } = Tabs

export enum TrackTabs {
    'view' = 'view',
    'create' = 'create',
}

export interface ISetTab {
    setTab: React.Dispatch<React.SetStateAction<TrackTabs>>
}

const TabContainer = styled.div`
    .ant-tabs-content-holder {
        margin-top: 15px;
    }
`

const LearningTrackTabs = () => {
    const [tab, setTab] = useState<TrackTabs>(TrackTabs.view)
    return (
        <TabContainer>
            <Tabs activeKey={tab} onChange={key => setTab(key as TrackTabs)}>
                <TabPane tab={'View'} key={'view'}>
                    <TrackList setTab={setTab} />
                </TabPane>
                <TabPane tab={'Create'} key={'create'}>
                    <TrackForm setTab={setTab} />
                </TabPane>
            </Tabs>
        </TabContainer>
    )
}

export default LearningTrackTabs
