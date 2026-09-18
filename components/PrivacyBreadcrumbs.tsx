import { HomeOutlined } from '@ant-design/icons'
import { Breadcrumb } from 'antd'
import Link from 'next/link'
const { Item } = Breadcrumb

const PrivacyBreadcrumbs = () => {
    return (
        <Breadcrumb>
            <Item key={'home'}>
                <Link legacyBehavior href={'/'} passHref>
                    <HomeOutlined />
                </Link>
            </Item>
            <Item key='privacy'>
                <Link legacyBehavior href='/privacy'>
                    <a>Privacy</a>
                </Link>
            </Item>
        </Breadcrumb>
    )
}

export default PrivacyBreadcrumbs
