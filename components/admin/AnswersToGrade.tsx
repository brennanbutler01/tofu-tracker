import PendingReviews from './PendingReviews'
import { Button, Empty, Grid, List, Skeleton } from 'antd'
import { useGradeAnswersSWR } from '@/services/toGrade/useGradeAnswersSWR'
import styled from 'styled-components'
import { HighlightOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { useAnswerListSelect } from '@/components/admin/useAnswerListSelect'
import AnswerListItem from '@/components/admin/AnswerListItem'
import AnswerListHeader from '@/components/admin/AnswerListHeader'

const ListContainer = styled.div`
    margin-top: 15px;

    &&& {
        .ant-list-header {
            border-bottom: 1px solid ${props => props.theme['tofu-brand-5']};
        }

        //noinspection ALL
        .ant-list-split.ant-list-something-after-last-item
            .ant-spin-container
            > .ant-list-items
            > .ant-list-item:last-child {
            border-bottom: 1px solid ${props => props.theme['tofu-brand-5']};
        }

        .select-answer {
            order: -1;
            margin-right: 15px;
        }

        //MAKE BUTTON DISABLED
        .ant-btn-primary[disabled],
        .ant-btn-primary[disabled]:hover,
        .ant-btn-primary[disabled]:focus,
        .ant-btn-primary[disabled]:active {
            color: rgba(232, 230, 227, 0.25);
            border-color: rgb(99, 92, 82);
            background-color: rgb(30, 32, 33);
            background-image: none;
            text-shadow: none;
            box-shadow: none;
        }
    }
`

function AnswersToGrade() {
    const answersToGrade = useGradeAnswersSWR({})
    const {
        startGrading,
        selectKey,
        selectAllKeys,
        indeterminate,
        checkAll,
        selectedKeys,
        loading,
    } = useAnswerListSelect()

    const [gradeSessionLoading, setGradeSessionLoading] = useState(false)

    const breakpoint = Grid.useBreakpoint()
    return (
        <ListContainer>
            <PendingReviews />
            <Skeleton active loading={!answersToGrade}>
                <List
                    loading={!answersToGrade || loading}
                    bordered
                    header={
                        <AnswerListHeader
                            checkAll={checkAll}
                            selectAllKeys={selectAllKeys}
                            indeterminate={indeterminate}
                        />
                    }
                    footer={
                        <Button
                            block
                            icon={<HighlightOutlined />}
                            type={'primary'}
                            onClick={startGrading}
                            disabled={selectedKeys?.length === 0}
                            loading={gradeSessionLoading}
                        >
                            Begin Grading
                        </Button>
                    }
                    locale={{
                        emptyText: (
                            <Empty description={'No answers to grade.'}></Empty>
                        ),
                    }}
                    itemLayout={breakpoint.sm ? 'horizontal' : 'vertical'}
                    dataSource={answersToGrade}
                    renderItem={item => (
                        <AnswerListItem
                            item={item}
                            selectedKeys={selectedKeys}
                            selectKey={selectKey}
                            setLoading={setGradeSessionLoading}
                            loading={gradeSessionLoading}
                        />
                    )}
                />
            </Skeleton>
        </ListContainer>
    )
}

export default AnswersToGrade
