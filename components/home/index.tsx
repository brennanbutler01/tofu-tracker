import { Col, Row, Space, Typography } from 'antd'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import styled from 'styled-components'
import IntroParagraph from './IntroParagraph'
import IntroTypewriter from './IntroTypewriter'
import PlayActivityList from './PlayActivityList'
const { Title } = Typography

const HomeTitle = styled(Title)`
    &&& {
        word-wrap: break-word;
        white-space: normal;
    }
`

const Home = () => {
    const session = useSession()

    return (
        <Space direction='vertical' style={{ width: '100%' }}>
            <Row justify='center' gutter={[8, 8]}>
                <Col span={20} md={12} lg={10} xl={8}>
                    <Space direction='vertical' size='large'>
                        <HomeTitle>Tofu Tracker</HomeTitle>
                        <IntroTypewriter />
                        <IntroParagraph />
                        {session?.status === 'authenticated' && (
                            <Row>
                                <Col span={24}>
                                    <PlayActivityList />
                                </Col>
                            </Row>
                        )}

                        <Row justify='center'>
                            <Col
                                span={24}
                                style={{
                                    justifyContent: 'center',
                                    display: 'flex',
                                }}
                            >
                                <Image
                                    src={'/front-tofu-500x500.png'}
                                    height={500}
                                    width={500}
                                    alt='Tofu Tracker mascot'
                                />
                            </Col>
                        </Row>
                    </Space>
                </Col>
            </Row>
        </Space>
    )
}

export default Home
