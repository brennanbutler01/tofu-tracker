import { Breadcrumb } from 'antd'
import Link from 'next/link'
import { HomeOutlined } from '@ant-design/icons'
import React from 'react'

const { Item } = Breadcrumb
export const AdminBreadcrumb: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <Breadcrumb>
            <Item>
                <Link legacyBehavior href={'/'} passHref>
                    <a>
                        <HomeOutlined />
                    </a>
                </Link>
            </Item>
            <Item>
                <Link legacyBehavior href={'/admin'} passHref>
                    <a>Admin</a>
                </Link>
            </Item>
            {children}
        </Breadcrumb>
    )
}
