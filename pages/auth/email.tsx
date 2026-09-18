//pages/auth/email.tsx

import { StyledCard } from '@/components/game/QuizCard'
import { Button, Card, Input, Space, Typography } from 'antd'
import { useRouter } from 'next/router'
import styled from 'styled-components'
const { Meta } = Card,
    { Title } = Typography

const EmailContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`

export default function EmailSignin() {
    const { query } = useRouter()
    return (
        <EmailContainer>
            <StyledCard
                title={
                    <Title
                        level={3}
                        style={{ whiteSpace: 'normal', wordWrap: 'normal' }}
                    >
                        Verify email
                    </Title>
                }
                actions={[
                    <Button
                        form='email-form'
                        htmlType='submit'
                        type='primary'
                        key='signin'
                    >
                        Complete sign in
                    </Button>,
                ]}
            >
                <Meta
                    description={
                        <form
                            action='/api/auth/callback/email'
                            method='get'
                            id='email-form'
                        >
                            <Space direction='vertical'>
                                {/* remove `type` and `value` if you want the user to type this manually */}

                                <Input placeholder='token' name='token' />

                                <Input
                                    name='callbackUrl'
                                    type='hidden'
                                    value={'/'}
                                />

                                <Input
                                    name='email'
                                    placeholder='email'
                                    value={query.email}
                                />
                            </Space>
                        </form>
                    }
                />
            </StyledCard>
        </EmailContainer>
    )
}
