import React from 'react'
import { Breadcrumb } from 'antd'
import Link from 'next/link'
import { HomeOutlined } from '@ant-design/icons'

const { Item } = Breadcrumb

export const LearningTrackBreadcrumb: React.FC<React.PropsWithChildren> = ({ children }) => (
    <Breadcrumb>
        <Item>
            <Link legacyBehavior href={'/'} passHref>
                <a>
                    <HomeOutlined />
                </a>
            </Link>
        </Item>
        <Item>
            <Link legacyBehavior href={'/learningTracks'} passHref>
                <a>Learning Tracks</a>
            </Link>
        </Item>
        {children}
    </Breadcrumb>
)
