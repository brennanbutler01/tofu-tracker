import { Button, Grid, Space } from 'antd'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { LoginOutlined } from '@ant-design/icons'

const Auth = () => {
    const { status, data: session } = useSession()
    const breakpoint = Grid.useBreakpoint()

    console.log('this is our session', session, status)

    return (
        <Space>
            {status === 'loading' ? (
                <Button loading={true}>Loading</Button>
            ) : status === 'authenticated' ? (
                //  we will use the link component rather than the signOut fn provided by  next-auth so we can use our custom page.
                <Link legacyBehavior href={'/api/auth/signout'} passHref>
                    <Button danger type={'primary'}>
                        SIGN OUT
                    </Button>
                </Link>
            ) : (
                <Link legacyBehavior href={'/api/auth/signin'} passHref>
                    <Button type={'text'} icon={<LoginOutlined />}>
                        SIGN IN
                    </Button>
                </Link>
            )}
        </Space>
    )
}

export default Auth
