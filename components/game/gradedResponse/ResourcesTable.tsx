import { Col, Collapse, Input, Row, Space, Table, Typography } from 'antd'
import { StyledTag } from '@/decks/DeckTags'
import FormLabel from '@/components/FormLabel'
import { GradedUserResponse } from '@/pages/api/graded'
import { useTheme } from 'styled-components'
import { CollapseWrapper } from '@/components/game/QuizResults'
const { Panel } = Collapse,
    { Paragraph } = Typography

interface IResourceTable {
    record: GradedUserResponse
}

const ResourcesTable = ({ record }: IResourceTable) => {
    const theme = useTheme()
    return (
        <CollapseWrapper>
            <Collapse>
                <Panel key={'resources'} header={'Resources'}>
                    <Table
                        id={'resources'}
                        bordered
                        dataSource={record?.critique?.resources}
                        columns={[
                            { title: 'Title', dataIndex: 'title' },
                            {
                                title: 'Tags',
                                dataIndex: 'tags',
                                render: (_, record) => (
                                    <Space>
                                        {record.tags.map(t => (
                                            <StyledTag
                                                color={theme['tofu-brand-1']}
                                                key={t}
                                            >
                                                {t}
                                            </StyledTag>
                                        ))}
                                    </Space>
                                ),
                            },
                        ]}
                        pagination={false}
                        expandable={{
                            expandedRowRender: record => (
                                <Row gutter={[32, 8]}>
                                    <Col span={16}>
                                        <FormLabel label={'Description'} />
                                    </Col>
                                    <Col span={16}>
                                        <Paragraph>
                                            {record.description}
                                        </Paragraph>
                                    </Col>
                                </Row>
                            ),
                        }}
                    />
                </Panel>
            </Collapse>
        </CollapseWrapper>
    )
}

export default ResourcesTable
