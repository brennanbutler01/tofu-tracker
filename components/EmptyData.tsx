import { Button, Empty, Space, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const EmptyData = () => {
    return (
        <Empty
            image={`/tofu-empty.png`}
            // imageStyle={{ width: 93.75, height: 75 }}
            description={
                <Space direction={'vertical'}>
                    <Typography.Title level={4}>Deck</Typography.Title>
                    <Button icon={<PlusOutlined />} type={'primary'}>
                        Create
                    </Button>
                </Space>
            }
        />
    )
}

export default EmptyData
