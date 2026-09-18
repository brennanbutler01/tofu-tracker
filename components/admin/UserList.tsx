import { useUsersSWR } from '@/services/users/useUsersSWR'
import { Col, Empty, Grid, List, Radio, Row, Segmented } from 'antd'
import styled from 'styled-components'
import UserListItem from '@/components/admin/UserListItem'
import { SegmentWrapper } from '@/components/game/ResultsSegment'
import { Teams } from '@prisma/client'
import FormLabel from '@/components/FormLabel'
import { useState } from 'react'
import { GroupContainer } from '@/questions/QuestionTypes'

const UserRow = styled(Row)`
    margin-top: 10px;
    .ant-list-item-action {
        display: flex;
        align-items: center;
    }
    .ant-list-item-action-split {
        display: none;
    }
    .ant-list-split .ant-list-item {
        border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
    }
`

const segmentedOptions = [
    {
        label: 'All',
        key: 'all',
        value: 'all',
    },
    {
        label: 'Admin',
        key: Teams.ADMIN,
        value: Teams.ADMIN,
    },
    {
        label: 'Eligibility',
        key: Teams.ELIGIBILITY,
        value: Teams.ELIGIBILITY,
    },
    {
        label: 'Case Management',
        key: Teams.CASE_MANAGEMENT,
        value: Teams.CASE_MANAGEMENT,
    },
    {
        label: 'Unassigned',
        key: Teams.UNASSIGNED,
        value: Teams.UNASSIGNED,
    },
    {
        label: 'Leadership',
        key: Teams.LEADERSHIP,
        value: Teams.LEADERSHIP,
    },
]

const UserList = () => {
    const users = useUsersSWR()
    const [teamFilter, setTeamFilter] = useState('all')
    const breakpoint = Grid.useBreakpoint()

    return (
        <UserRow gutter={[0, 8]}>
            <Col span={24}>
                <GroupContainer>
                    <SegmentWrapper
                        style={{
                            display: 'flex',
                            justifyContent: 'start',
                            gap: '10px',
                        }}
                    >
                        <FormLabel label={'Filter by Teams'} />
                        {breakpoint.md ? (
                            <Segmented
                                options={segmentedOptions}
                                value={teamFilter}
                                onChange={val => setTeamFilter(val.toString())}
                            />
                        ) : (
                            <Radio.Group
                                options={segmentedOptions}
                                value={teamFilter}
                                onChange={el => setTeamFilter(el.target.value)}
                            />
                        )}
                    </SegmentWrapper>
                </GroupContainer>
            </Col>
            <Col span={20} md={16}>
                <List
                    itemLayout={'vertical'}
                    dataSource={users.filter(l =>
                        teamFilter === 'all' ? l : l.team === teamFilter
                    )}
                    renderItem={item => <UserListItem item={item} />}
                    locale={{ emptyText: <Empty description={'No Users'} /> }}
                />
            </Col>
        </UserRow>
    )
}

export default UserList
