// noinspection JSUnusedGlobalSymbols

import { getProviders, signIn, useSession } from 'next-auth/react'
import { Button, Card, Form, Input, message, Space } from 'antd'
import { AuthContainer } from './signout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AuthImage } from '@/components/AuthImage'
import styled from 'styled-components'

const { Item } = Form,
    { Meta } = Card

export interface Providers {
    id: 'google' | 'email'
    name: 'Google' | 'Email'
    type: 'oath' | 'email'
    signinUrl: string
    callbackUrl: string
}

interface ISignIn {
    providers: Array<Providers>
}

const StyledMeta = styled(Meta)`
    &&& {
        .ant-form-item-explain {
            max-width: 250px;
        }
    }
`

interface ISignInForm {
    email: string
}

function SignIn({ providers }: ISignIn) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const session = useSession()
    const { push } = useRouter()
    const [form] = Form.useForm<ISignInForm>()

    useEffect(() => {
        if (session.status === 'authenticated') {
            setLoading(true)
            push('/')
        }
    }, [session, push])

    return (
        <AuthContainer>
            <Card
                bordered={false}
                loading={loading || session.status === 'loading'}
                cover={<AuthImage />}
            >
                <Space direction={'vertical'} align={'center'}>
                    <StyledMeta
                        description={
                            <Form layout={'vertical'} form={form}>
                                <Space direction={'vertical'} size={'large'}>
                                    <Space
                                        direction={'vertical'}
                                        size={'small'}
                                    >
                                        <Item
                                            name={'email'}
                                            label={'Email'}
                                            style={{ marginBottom: '10px' }}
                                            // help="If you are signing in from an odhs domain, make sure to use the new email format: email@odhsoha.oregon.gov."
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'Please enter an email',
                                                },
                                            ]}
                                        >
                                            <Input
                                                type='email'
                                                placeholder={
                                                    'tofu@tofu-tracker.io'
                                                }
                                                value={email}
                                                onChange={e =>
                                                    setEmail(e.target.value)
                                                }
                                            />
                                        </Item>
                                        <Item>
                                            <Button
                                                block
                                                type={'primary'}
                                                onClick={() => {
                                                    // setLoading(true);
                                                    signIn('email', {
                                                        email,
                                                    })
                                                    // console.log("code", code);
                                                }}
                                            >
                                                Sign in with email
                                            </Button>
                                        </Item>
                                    </Space>
                                </Space>
                            </Form>
                        }
                    />
                </Space>
            </Card>
        </AuthContainer>
    )
}

export const getServerSideProps = async () => {
    const providers = await getProviders()
    return {
        props: {
            providers,
        },
    }
}

export default SignIn
