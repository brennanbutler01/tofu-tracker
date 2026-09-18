import { HomeOutlined } from '@ant-design/icons'
import { Breadcrumb } from 'antd'
import Link from 'next/link'
const { Item } = Breadcrumb

const PlayActivityBreadcrumb: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <Breadcrumb>
            <Item>
                <Link legacyBehavior href='/'>
                    <a>
                        <HomeOutlined />
                    </a>
                </Link>
            </Item>
            <Item>Activity</Item>
            {children}
        </Breadcrumb>
    )
}

export default PlayActivityBreadcrumb
