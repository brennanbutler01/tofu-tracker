import AppLayout from '@/components/AppLayout'
import HeadLayout from '@/components/HeadLayout'
import PrivacyBreadcrumbs from '@/components/PrivacyBreadcrumbs'
import { PrivacyPolicy } from '@/components/PrivacyPolicy'
import { HomeOutlined } from '@ant-design/icons'
import { Breadcrumb, Col, PageHeader, Row, Typography } from 'antd'
import { useRouter } from 'next/router'
import styled from 'styled-components'
const { Title } = Typography

const PageHeaderWrapper = styled.div`
    &&& {
        .ant-page-header-heading-title {
            white-space: normal;
        }
    }
`

const Privacy = () => {
    const { back } = useRouter()
    return (
        <div>
            <AppLayout>
                <HeadLayout title={'Privacy Policy'} />
                <PageHeaderWrapper>
                    <PageHeader
                        onBack={back}
                        title={
                            <Title
                                level={1}
                                style={{
                                    whiteSpace: 'normal',
                                    wordWrap: 'normal',
                                    marginBottom: 0,
                                }}
                            >
                                Privacy Policy of Tofu Tracker
                            </Title>
                        }
                        breadcrumb={<PrivacyBreadcrumbs />}
                    />
                </PageHeaderWrapper>
                <Row>
                    <Col span={24}>
                        <PrivacyPolicy />
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}

export default Privacy
