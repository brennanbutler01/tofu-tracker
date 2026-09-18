import { Tabs } from 'antd'
import styled from 'styled-components'
import AnswersToGrade from '@/components/admin/AnswersToGrade'
import UserList from '@/components/admin/UserList'
const { TabPane } = Tabs

const TabContainer = styled.div`
    &&& {
        .ant-tabs-nav:before {
            border-bottom: 1px solid ${props => props.theme['tofu-brand-5']};
        }
        .ant-tabs-content-holder {
            margin-top: 10px;
        }
    }
`

const AdminTabs = () => {
    return (
        <TabContainer>
            <Tabs>
                <TabPane key={'grade'} tab={'Grade'}>
                    <AnswersToGrade />
                </TabPane>
                <TabPane key={'users'} tab={'Users'}>
                    <UserList />
                </TabPane>
            </Tabs>
        </TabContainer>
    )
}
export default AdminTabs
