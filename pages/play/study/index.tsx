import HeadLayout from '@/components/HeadLayout'
import AppLayout from '@/components/AppLayout'
import { Breadcrumb, PageHeader, Typography } from 'antd'
import { useRouter } from 'next/router'
import { PlayBreadcrumb } from '@/components/game/PlayBreadcrumb'
import StructuredStudyTabs from '@/components/game/StructuredStudyTabs'
const { Item } = Breadcrumb,
    { Title } = Typography

const Study = () => {
    const { back } = useRouter()
    return (
        <div>
            <HeadLayout title={'Study'} />
            <AppLayout>
                <PageHeader
                    title={
                        <Title
                            level={1}
                            style={{
                                marginBottom: 0,
                                whiteSpace: 'normal',
                                wordWrap: 'normal',
                            }}
                        >
                            Study
                        </Title>
                    }
                    onBack={back}
                    breadcrumb={
                        <PlayBreadcrumb>
                            <Item href={'/play/study'}>Study</Item>
                        </PlayBreadcrumb>
                    }
                    footer={<StructuredStudyTabs />}
                />
            </AppLayout>
        </div>
    )
}

export default Study
