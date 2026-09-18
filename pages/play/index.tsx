import HeadLayout from '@/components/HeadLayout'
import AppLayout from '@/components/AppLayout'
import { Col, Grid, PageHeader, Row, Space, Typography } from 'antd'
import { useRouter } from 'next/router'
import PlayCard from '@/components/game/PlayCard'
import { PlayBreadcrumb } from '@/components/game/PlayBreadcrumb'
const { Title } = Typography

const Play = () => {
    const { back } = useRouter()
    const breakpoint = Grid.useBreakpoint()

    return (
        <div>
            <HeadLayout title={'Study'} />
            <AppLayout>
                <PageHeader
                    breadcrumb={<PlayBreadcrumb />}
                    title={
                        <Space style={{ width: '100%' }} direction='vertical'>
                            <Title
                                level={1}
                                style={{
                                    marginBottom: 0,
                                    whiteSpace: 'normal',
                                    wordWrap: 'normal',
                                }}
                            >
                                Study
                            </Title>
                            {breakpoint.md ? null : (
                                <Title
                                    level={5}
                                    type='secondary'
                                    style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                    }}
                                >
                                    Personalize your learning experience with
                                    Free Play or complete a structured course.
                                </Title>
                            )}
                        </Space>
                    }
                    {...(breakpoint.md && {
                        subTitle:
                            'Personalize your learning experience with Free Play or complete a structured game!  ',
                    })}
                    onBack={back}
                />
                <Row gutter={32}>
                    <Col span={24} md={12}>
                        <PlayCard playType={'free'} />
                    </Col>
                    <Col span={24} md={12}>
                        <PlayCard playType={'structured'} />
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}
export default Play
