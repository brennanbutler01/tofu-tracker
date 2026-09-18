import { Roles } from '@prisma/client'
import { Grid, List, Space, Typography } from 'antd'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { FooterLink, StyledFooter } from './AppLayout'
const { Title } = Typography,
    { Item } = List

interface IAppFooter {
    setDrawerVisible: () => void
}

const AppFooter = ({ setDrawerVisible }: IAppFooter) => {
    const breakpoint = Grid.useBreakpoint()
    const session = useSession()

    const logoPrivacy = (
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Space
                direction='vertical'
                style={{
                    textAlign: 'center',
                }}
            >
                <Link legacyBehavior href={'/'} passHref>
                    <a>
                        <Image
                            src={'/logo-500x300.png'}
                            width={175}
                            height={115}
                            alt={'logo for tofu-tracker'}
                        />
                    </a>
                </Link>
                <Link legacyBehavior href={'/privacy'} passHref>
                    <FooterLink>Privacy Policy</FooterLink>
                </Link>
            </Space>
        </div>
    )

    const adminLinks = (
        <List
            header={
                <Title level={5} style={{ marginBottom: 0 }}>
                    Administrator Tools
                </Title>
            }
            split={false}
            dataSource={[
                { text: 'Admin', link: '/admin' },
                { text: 'Courses', link: '/courses' },
                { text: 'Decks', link: '/decks' },
                { text: 'Learning Tracks', link: '/learningTracks' },
                { text: 'Metrics', link: '/metrics' },
            ]}
            renderItem={item => (
                <Item key={item.text}>
                    <Link legacyBehavior href={item.link} passHref>
                        <FooterLink>{item.text}</FooterLink>
                    </Link>
                </Item>
            )}
        />
    )

    const userLinks = (
        <List
            header={
                <Title level={5} style={{ marginBottom: 0 }}>
                    Manage your experience
                </Title>
            }
            dataSource={[
                //TODO - add this back in
                // { text: "Play", link: "/play" },
                { text: 'Profile', link: '/profile' },
                { text: 'Leave Feedback', link: '/userFeedback' },
            ]}
            renderItem={item => (
                <Item key={item.text}>
                    {item.text === 'Leave Feedback' ? (
                        <FooterLink onClick={setDrawerVisible}>
                            Leave feedback
                        </FooterLink>
                    ) : (
                        <Link legacyBehavior href={item.link} passHref>
                            <FooterLink>{item.text}</FooterLink>
                        </Link>
                    )}
                </Item>
            )}
            split={false}
        />
    )
    return (
        <StyledFooter>
            <Space
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: breakpoint.md ? 'flex-start' : 'center',
                    height: '100%',
                    justifyContent:
                        session?.status === 'unauthenticated'
                            ? 'center'
                            : 'space-around',
                    flexDirection: breakpoint.sm ? 'row' : 'column',
                }}
            >
                {logoPrivacy}
                {session?.status === 'authenticated' && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '5vw',
                            alignItems: 'start',
                            marginLeft: breakpoint.xl ? '5vw' : 0,
                        }}
                    >
                        {session?.data?.user?.role === Roles.ADMIN && (
                            <>{adminLinks}</>
                        )}
                        {userLinks}
                    </div>
                )}
            </Space>
        </StyledFooter>
    )
}

export default AppFooter
