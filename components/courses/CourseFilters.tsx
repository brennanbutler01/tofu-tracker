import {
    Col,
    Form,
    Grid,
    Input,
    Radio,
    Row,
    Segmented,
    Space,
    Switch,
} from 'antd'
import FormLabel from '@/components/FormLabel'
import { SegmentWrapper } from '@/components/game/ResultsSegment'
import React from 'react'
import { CourseLevel } from '@prisma/client'
import { SwitchContainer } from '@/questions/QuestionForm'
import { StyledCard } from '../game/QuizCard'
import { GroupContainer } from '@/questions/QuestionTypes'
const { Item } = Form,
    { Search } = Input,
    { Group } = Radio

const filterOptions = [
    { label: 'No Filter', value: 'none' },
    ...Object.values(CourseLevel).map(val => ({
        label: val,
        value: val,
    })),
]
const filterArray = ['none', ...Object.values(CourseLevel)]
export type CourseFilter = typeof filterArray[number]

interface ICourseFilters {
    filter: CourseFilter
    setFilter: React.Dispatch<React.SetStateAction<CourseFilter>>
    search: string
    setSearch: React.Dispatch<React.SetStateAction<string>>
}

interface ISwitchForm {
    showFilters: boolean
    search: string
}

const CourseFilters = ({
    filter,
    setFilter,
    search,
    setSearch,
}: ICourseFilters) => {
    const breakpoint = Grid.useBreakpoint()
    const [form] = Form.useForm<ISwitchForm>()
    const showFilters = Form.useWatch('showFilters', form)

    return (
        <Form form={form}>
            <Space direction={'vertical'}>
                <SwitchContainer>
                    <Item
                        name={'showFilters'}
                        label={<FormLabel label={'Show Filters?'} />}
                        style={{ marginBottom: 0 }}
                    >
                        <Switch />
                    </Item>
                </SwitchContainer>
                {showFilters && (
                    <StyledCard>
                        <Row gutter={[0, 16]}>
                            <Col span={24} md={12} lg={8} xxl={6}>
                                <Item name={'search'}>
                                    <Search
                                        placeholder={'Search for course'}
                                        value={search}
                                        onChange={val =>
                                            setSearch(val.target.value)
                                        }
                                    />
                                </Item>
                            </Col>

                            <Col span={24}>
                                <GroupContainer>
                                    <SegmentWrapper
                                        style={{ justifyContent: 'start' }}
                                    >
                                        <Space
                                            direction={
                                                breakpoint.md
                                                    ? 'horizontal'
                                                    : 'vertical'
                                            }
                                        >
                                            <FormLabel
                                                label={'Filter by course level'}
                                            />
                                            {breakpoint.md ? (
                                                <Segmented
                                                    value={filter}
                                                    onChange={val =>
                                                        setFilter(
                                                            val as CourseFilter
                                                        )
                                                    }
                                                    options={filterOptions}
                                                />
                                            ) : (
                                                <Group
                                                    value={filter}
                                                    options={filterOptions}
                                                    onChange={e =>
                                                        setFilter(
                                                            e.target
                                                                .value as CourseFilter
                                                        )
                                                    }
                                                />
                                            )}
                                        </Space>
                                    </SegmentWrapper>
                                </GroupContainer>
                            </Col>
                        </Row>
                    </StyledCard>
                )}
            </Space>
        </Form>
    )
}
export default CourseFilters
