import React, { useEffect, useState } from 'react'

import DeckForm from '@/decks/DeckForm'
import Decks from '@/decks/index'
import { Col, Row, Tabs } from 'antd'
import styled from 'styled-components'
import { useRouter } from 'next/router'

const { TabPane } = Tabs

const TabWrapper = styled.div`
    &&& {
        .ant-tabs-top > .ant-tabs-nav::before,
        .ant-tabs-bottom > .ant-tabs-nav::before,
        .ant-tabs-top > div > .ant-tabs-nav::before,
        .ant-tabs-bottom > div > .ant-tabs-nav::before {
            border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
        }
        .ant-tabs-content-holder {
            margin-top: 3vh;
        }
    }
`

export type DeckTabKeys = 'view' | 'create'

interface IDeckTabs {
    selectTab?: DeckTabKeys
}

const DeckTabs = ({ selectTab }: IDeckTabs) => {
    const [tab, setTab] = useState<DeckTabKeys>('view')
    const router = useRouter()

    useEffect(() => {
        if (router.query.tab === 'create') {
            setTab('create')
            router.push('/decks')
        }
    }, [router, router.query])

    useEffect(() => {
        if (selectTab) {
            setTab(selectTab)
        }
    }, [selectTab])

    return (
        <TabWrapper>
            <Tabs
                onChange={k => setTab(k as DeckTabKeys)}
                activeKey={selectTab || tab}
            >
                <TabPane tab={'View Decks'} key={'view'}>
                    <Decks setTab={setTab} />
                </TabPane>
                <TabPane tab={'Create Deck'} key={'create'}>
                    <Row justify={'center'}>
                        <Col span={24} md={16} lg={12} xxl={10}>
                            <DeckForm />
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        </TabWrapper>
    )
}

export default DeckTabs
