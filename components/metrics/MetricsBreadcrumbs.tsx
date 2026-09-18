import { Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Item } = Breadcrumb

export const MetricsBreadcrumbs: React.FC<React.PropsWithChildren> = ({ children }) => (
    <Breadcrumb>
        <Item>
            <Link legacyBehavior href={'/'}>
                <a>
                    <HomeOutlined />
                </a>
            </Link>
        </Item>
        <Item>Metrics</Item>
        {children}
    </Breadcrumb>
)
