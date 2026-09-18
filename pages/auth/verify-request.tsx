// noinspection JSUnusedGlobalSymbols

import { GetServerSidePropsContext } from 'next'
import { Button, Col, Result, Row } from 'antd'
import Link from 'next/link'
import { AuthContainer } from '@/pages/auth/signout'
import { BackwardOutlined } from '@ant-design/icons'
import { StyledCard } from '@/components/game/QuizCard'
const { Meta } = StyledCard

const VerifyRequest = ({ location }: { location: string }) => (
    <AuthContainer>
        <Row justify='center'>
            <Col span={22} md={18} lg={14}>
                <StyledCard>
                    <Meta
                        description={
                            <Result
                                status={'success'}
                                title={'Check your email!'}
                                subTitle={
                                    'A sign in link has been sent to your email address! Please follow that link to login without needing to enter a password. Check your junk and wait around 5 minutes for delivery'
                                }
                                extra={[
                                    <Link legacyBehavior href={'/'} key={'host'} passHref>
                                        <Button
                                            type={'dashed'}
                                            icon={<BackwardOutlined />}
                                            size={'large'}
                                        >
                                            {location}
                                        </Button>
                                    </Link>,
                                ]}
                            />
                        }
                    />
                </StyledCard>
            </Col>
        </Row>
    </AuthContainer>
)
export default VerifyRequest

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => ({
    props: {
        location: context.req.headers.host,
    },
})
