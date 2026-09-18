import DemoControls from './DemoControls'
import {
    Col,
    Drawer,
    Grid,
    Layout,
    List,
    Result,
    Row,
    Spin,
    Typography,
} from 'antd'
import Nav from './nav'
import React, { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { device } from '@/utils/breakpoints'
import { useSession } from 'next-auth/react'
import Auth from './Auth'
import { useRouter } from 'next/router'
import { Roles } from '@prisma/client'
import UserFeedback from './userFeedback/FeedbackForm'
import { SelectContainer } from './decks/DeckCategories'
import AppFooter from './AppFooter'

const { Header, Content, Footer } = Layout,
    { Title } = Typography,
    { Item } = List

const StyledContent = styled(Content)`
        &&& {
            .ant-page-header-back-button {
                color: ${props => props.theme['tofu-yellow']};

                :hover {
                    color: ${props => props.theme['tofu-green']};
                }
            }

            padding: 8px;
            @media (${device.laptop}) {
                padding: 5vh 8vw;
            }
        }
    `,
    StyledHeader = styled(Header)`
        padding-left: 8px;
        padding-right: 8px;
        overflow: hidden;
        height: 90px;
    `,
    StyledLayout = styled(Layout)`
        &&& {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            justify-content: space-between;
        }
    `
export const StyledFooter = styled(Footer)`
        margin-top: auto;
        flex: 0 0 50px;
        display: flex;
    `,
    FooterLink = styled(Typography.Link)`
        &&& {
            color: ${props => props.theme['tofu-text-secondary']};
        }
    `

const PageContainer = styled.div`
    &&& {
        //this is the background for our active title.
        .ant-menu-item:active,
        .ant-menu-submenu-title:active {
            background: ${props => props.theme['tofu-brand-3']};
        }

        .ant-menu-item:active,
        .ant-menu-submenu-title:active {
            background: ${props => props.theme['tofu-brand-3']};
        }

        .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
            background-color: ${props => props.theme['tofu-brand-4']};
        }

        .ant-menu-horizontal {
            display: flex;
            justify-content: end;
            height: 50px;
        }

        .ant-menu-vertical {
            border-right: 1px solid ${props => props.theme['tofu-brand-4']};
        }

        .ant-drawer-header {
            border-bottom: 1px solid ${props => props.theme['tofu-brand-4']};
        }
    }
`

interface ILayout {
    adminOnly?: boolean
}

//this component styles our pages and keeps a consistent layout throughout the application
const AppLayout: React.FC<React.PropsWithChildren<ILayout>> = ({
    children,
    adminOnly = false,
}) => {
    const { data: session, status } = useSession()
    const { pathname, push } = useRouter()
    const [feedbackVisible, setFeedbackVisible] = useState(false)
    const theme = useTheme()

    const breakpoint = Grid.useBreakpoint()

    const nav = (
        <StyledHeader>
            <Nav />
        </StyledHeader>
    )

    //TODO need to get rid of alert
    const authorizedPage = (
        <StyledLayout>
            {nav}
            <StyledContent>
                <DemoControls />
                <Row justify={'center'}>
                    {/*{session?.user?.role === Roles.ADMIN && (*/}
                    {/*  <Col span={20}>*/}
                    {/*    <Alert*/}
                    {/*      closable*/}
                    {/*      onClick={async () => push("/admin")}*/}
                    {/*      style={{*/}
                    {/*        backgroundImage:*/}
                    {/*          "linear-gradient(to right, rgba(0, 48, 34, 0.95), #18947f)",*/}
                    {/*      }}*/}
                    {/*      banner*/}
                    {/*      message={*/}
                    {/*        <Space>*/}
                    {/*          <Text>Questions waiting for a grade:</Text>*/}
                    {/*          {answersToGrade ? (*/}
                    {/*            <Text strong>{answersToGrade?.length || 0}</Text>*/}
                    {/*          ) : (*/}
                    {/*            <Spin />*/}
                    {/*          )}*/}
                    {/*        </Space>*/}
                    {/*      }*/}
                    {/*    />*/}
                    {/*  </Col>*/}
                    {/*)}*/}

                    <Col span={24}>{children}</Col>
                </Row>
            </StyledContent>
            <AppFooter setDrawerVisible={() => setFeedbackVisible(true)} />
        </StyledLayout>
    )

    const signIn = (
        <StyledLayout>
            {nav}
            <StyledContent>
                <DemoControls />
                <Row>
                    <Col span={24}>
                        <Result
                            status={'error'}
                            title={'Access denied'}
                            subTitle={'Please sign in'}
                            extra={<Auth />}
                        />
                    </Col>
                </Row>
            </StyledContent>
            <AppFooter setDrawerVisible={() => setFeedbackVisible(true)} />
        </StyledLayout>
    )

    const notAuthorized = (
        <StyledLayout>
            {nav}
            <StyledContent>
                <DemoControls />
                <Row>
                    <Col span={24}>
                        <Result
                            status={'error'}
                            title={'Admin only'}
                            subTitle={
                                'You must be a site administrator to view this page '
                            }
                        />
                    </Col>
                </Row>
            </StyledContent>
            <AppFooter setDrawerVisible={() => setFeedbackVisible(true)} />
        </StyledLayout>
    )

    const loading = (
        <StyledLayout>
            {nav}
            <StyledContent style={{ width: '100vw' }}>
                <div
                    style={{
                        width: '100vw',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Spin tip={'Checking authentication'} />
                </div>
            </StyledContent>
            <AppFooter setDrawerVisible={() => setFeedbackVisible(true)} />
        </StyledLayout>
    )

    const publicRoutes = ['/', '/privacy']

    //no session and not on home page, sign in
    return (
        <PageContainer id='pageContainer'>
            {status === 'loading'
                ? loading
                : !session && !publicRoutes.includes(pathname)
                ? signIn
                : //admin only and we are not an admin, show unauthorized
                adminOnly && session?.user?.role !== Roles.ADMIN
                ? notAuthorized
                : authorizedPage}
            <SelectContainer id='drawer'>
                <Drawer
                    visible={feedbackVisible}
                    onClose={() => setFeedbackVisible(false)}
                    closable={false}
                    width={breakpoint.xs ? 320 : 350}
                    title={
                        <Title level={3} style={{ marginBottom: 0 }}>
                            Leave Feedback
                        </Title>
                    }
                    headerStyle={{
                        borderBottom: `1px solid ${theme['tofu-brand-4']}`,
                    }}
                    // getContainer={() => document.getElementById("drawer") as HTMLElement}
                >
                    <UserFeedback
                        closeDrawer={() => setFeedbackVisible(false)}
                    />
                </Drawer>
            </SelectContainer>
        </PageContainer>
    )
}

export default AppLayout
