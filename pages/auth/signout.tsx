// noinspection JSUnusedGlobalSymbols
import React, { useState } from 'react'
import { getCsrfToken } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
    Button,
    Card,
    Col,
    Form,
    Grid,
    Input,
    Row,
    Space,
    Typography,
} from 'antd'
import { BackwardOutlined } from '@ant-design/icons'
import { GetServerSidePropsContext } from 'next'
import styled from 'styled-components'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { AuthImage } from '@/components/AuthImage'
const { Meta } = Card

interface ISignOut {
    csrfToken: string | null
}

export const AuthContainer = styled.div`
    align-items: center;
    display: flex;
    justify-content: center;
    height: 100vh;
    width: 100vw;

    &&& {
        .ant-card {
            background-color: ${props => props.theme['tofu-brand-3']};
            border: 1px solid ${props => props.theme['tofu-brand-6']};
            display: flex;
            flex-direction: column;
            justify-content: center;
            &:hover {
                box-shadow: ${props => props.theme['tofu-box-shadow']};
            }
        }

        .ant-card-head {
            border-bottom: 1px solid ${props => props.theme['tofu-brand-6']};
        }

        .ant-card-body {
            display: flex;
            justify-content: center;
        }

        .ant-typography.ant-typography-secondary {
            white-space: normal;
        }
    }
`

const { Title, Text } = Typography

const SignOut = ({ csrfToken }: ISignOut) => {
    const router = useRouter()
    const breakpoint = Grid.useBreakpoint()
    const [loading, setLoading] = useState(false)

    const submitForm = async () => {
        if (csrfToken) {
            try {
                await axios.post('/api/auth/signout', { csrfToken }).then(
                    async ({ request: { responseURL } }) =>
                        await router
                            .push(responseURL)
                            //this is from https://github.com/nextauthjs/next-auth/issues/596#issuecomment-943453568
                            //force the client side to refresh and revalidate since it doesn't want to do so on its own.
                            .then(() =>
                                document.dispatchEvent(
                                    new Event('visibilitychange')
                                )
                            )
                            .catch(err =>
                                console.log(
                                    'err refreshing client side session ',
                                    err
                                )
                            )
                )
            } catch (err) {
                console.log(`Error signing out: ${err}`)
            }
        }
    }

    const form = (
        <form action='/api/auth/signout' method='post'>
            <Input
                type='hidden'
                name='csrfToken'
                value={csrfToken || undefined}
            />
            <Space
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                <Button
                    icon={<BackwardOutlined />}
                    type={'dashed'}
                    onClick={() => router.back()}
                >
                    Go back
                </Button>
                <Button
                    formMethod='post'
                    htmlType='submit'
                    type={'primary'}
                    danger
                >
                    Sign out
                </Button>
            </Space>
        </form>
    )

    const cardTitle = (
        <Space direction={'vertical'} align={'center'}>
            <Title level={1} style={{ fontSize: '2.5rem', marginBottom: 0 }}>
                Sign Out
            </Title>
            <Text
                type={'secondary'}
                style={{
                    fontSize: '1.25rem',
                    textAlign: 'center',
                }}
            >
                Are you sure that you want to sign out?
            </Text>
        </Space>
    )

    return (
        <AuthContainer>
            <Row justify='center'>
                <Col span={22}>
                    <Card
                        loading={loading}
                        bordered={false}
                        title={cardTitle}
                        cover={<AuthImage />}
                    >
                        <Meta description={form} />
                    </Card>
                </Col>
            </Row>
        </AuthContainer>
    )
}
// noinspection JSUnusedGlobalSymbols
export default SignOut

// noinspection JSUnusedGlobalSymbols
export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => ({
    props: { csrfToken: await getCsrfToken(context) },
})
