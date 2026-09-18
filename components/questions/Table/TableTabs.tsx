import { Tabs } from 'antd'
import AnswerTable from '@/questions/Table/AnswerTable'
import React from 'react'
import { useSession } from 'next-auth/react'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import styled from 'styled-components'
import { QuestionType, Roles } from '@prisma/client'
import FreeResponseAnswer from '@/questions/Table/FreeResponseAnswer'
import SimpleResponseAnswer from '@/questions/Table/SimpleResponseAnswer'
import { QuestionStatsByUser } from '../QuestionStatsByUser'
const { TabPane } = Tabs

export interface ITableTabs {
    record: QuestionWithOptions
}

const TabWrapper = styled.div`
    &&& {
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab,
        .ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab {
            background: ${props => props.theme['tofu-brand-5']};
            border: ${props => `1px solid ${props.theme['tofu-brand-5']}`};
        }

        .ant-tabs-top > .ant-tabs-nav::before,
        .ant-tabs-bottom > .ant-tabs-nav::before,
        .ant-tabs-top > div > .ant-tabs-nav::before,
        .ant-tabs-bottom > div > .ant-tabs-nav::before {
            border-bottom: 1px solid ${props => props.theme['tofu-brand-5']};
        }

        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active,
        .ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab-active {
            background: ${props => props.theme['tofu-background-dark']};
        }
    }
`

const TableTabs = ({ record }: ITableTabs) => {
    const { data: session } = useSession()
    return (
        <TabWrapper>
            <Tabs>
                {record.type === QuestionType.FREE_RESPONSE ? (
                    <TabPane tab={'Expected Response'} key={'response'}>
                        <FreeResponseAnswer record={record} />
                    </TabPane>
                ) : record.type === QuestionType.SIMPLE_RESPONSE ? (
                    <TabPane tab={'Correct Answer'} key={'correct'}>
                        <SimpleResponseAnswer record={record} />
                    </TabPane>
                ) : (
                    <TabPane tab={'Answer Options'} key={'options'}>
                        <AnswerTable
                            question={record}
                            correctAnswer={record.correctAnswer}
                        />
                    </TabPane>
                )}
                {session?.user?.role === Roles.ADMIN && (
                    <TabPane tab={'Metrics'} key={'metrics'}>
                        <QuestionStatsByUser id={record.id} />
                    </TabPane>
                )}
            </Tabs>
        </TabWrapper>
    )
}

export default TableTabs
