import Link from 'next/link'
import { Button, Drawer, Grid, Menu, Typography } from 'antd'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { NAV_KEYS, useNavLinks } from '@/components/nav/useNavLinks'
import { useRouter } from 'next/router'
import { MenuOutlined } from '@ant-design/icons'
const { Title } = Typography

const StyledNav = styled.nav`
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
        }
    }
    display: flex;
    height: 100px;
    justify-content: space-between;
`

const Nav: React.FC = () => {
    const navItems = useNavLinks()
    const { pathname } = useRouter()
    const breakpoint = Grid.useBreakpoint()
    const [menuVisible, setMenuVisible] = useState(false)
    const theme = useTheme()
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])

    useEffect(() => {
        NAV_KEYS.forEach(key => {
            if (pathname.includes(key)) {
                setSelectedKeys([key])
            }
        })
    }, [pathname])

    const onDrawerClose = () => setMenuVisible(false)

    return (
        <StyledNav>
            <div>
                <Link legacyBehavior href={'/'}>
                    <a>
                        <Image
                            src={'/logo-250x150.png'}
                            width={125}
                            height={75}
                            alt={'logo for tofu-tracker'}
                        />
                    </a>
                </Link>
            </div>
            {breakpoint.lg ? (
                <Menu
                    getPopupContainer={el => el.parentNode as HTMLElement}
                    selectable={false}
                    selectedKeys={selectedKeys}
                    style={{ borderBottom: 'none', flexGrow: 1 }}
                    items={navItems}
                    onClick={({ key }) => setSelectedKeys([key])}
                    mode='horizontal'
                />
            ) : (
                <div style={{ marginTop: '10px' }}>
                    <Button
                        className='barsMenu'
                        type='primary'
                        icon={<MenuOutlined />}
                        onClick={() => setMenuVisible(!menuVisible)}
                    >
                        <span className='barsBtn'></span>
                    </Button>
                    <Drawer
                        title={
                            <Title level={3} style={{ marginBottom: 0 }}>
                                TofuTracker
                            </Title>
                        }
                        placement='right'
                        visible={menuVisible}
                        onClose={onDrawerClose}
                        closable={false}
                        getContainer={() =>
                            document.getElementById(
                                'pageContainer'
                            ) as HTMLElement
                        }
                        headerStyle={{
                            borderBottom: `1px solid ${theme['tofu-brand-4']}`,
                        }}
                        width={250}
                    >
                        {/* <LeftMenu /> */}
                        {/* <RightMenu /> */}
                        <Menu
                            getPopupContainer={el =>
                                el.parentNode as HTMLElement
                            }
                            selectable={false}
                            selectedKeys={selectedKeys}
                            style={{ borderBottom: 'none', flexGrow: 1 }}
                            items={navItems}
                            onClick={({ key }) => setSelectedKeys([key])}
                        />
                    </Drawer>
                </div>
            )}
        </StyledNav>
    )
}

export default Nav
