import { useActivitySWR } from '@/services/activities/useActivitySWR'
import { Collapse, List } from 'antd'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import styled from 'styled-components'
import { CollapseWrapper } from '../game/QuizResults'
import PlayActivityListItem from './PlayActivityListItem'
const { Panel } = Collapse

const ListWrapper = styled.div`
    .ant-list-split .ant-list-item {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-5']};
    }
`

const PlayActivityList = () => {
    const ourActivities = useActivitySWR({})
    const [loading, setLoading] = useState(false)
    const session = useSession()
    console.log('our activities', ourActivities, session)

    return (
        <>
            {session?.data?.user && (
                <CollapseWrapper>
                    <Collapse defaultActiveKey={'activities'}>
                        <Panel header='View Activities' key='activities'>
                            <ListWrapper>
                                <List
                                    loading={loading || !ourActivities}
                                    dataSource={ourActivities?.filter(
                                        oA => oA.displayOnMain
                                    )}
                                    itemLayout='vertical'
                                    renderItem={item => (
                                        <PlayActivityListItem
                                            activity={item}
                                            setLoading={setLoading}
                                        />
                                    )}
                                />
                            </ListWrapper>
                        </Panel>
                    </Collapse>
                </CollapseWrapper>
            )}
        </>
    )
}

export default PlayActivityList
