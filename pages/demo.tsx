import { Alert, Button, Card, Space, Typography } from 'antd'
import { useState } from 'react'
import HeadLayout from '@/components/HeadLayout'
import { visitorEnabled } from '@/server/visitorAccess'
const { Title, Paragraph } = Typography
export default function Demo() {
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const start = async () => {
        setBusy(true)
        setError('')
        try {
            const response = await fetch('/api/demo/session', {
                method: 'POST',
            })
            if (!response.ok)
                throw new Error(
                    response.status === 503
                        ? 'The demo is at capacity. Please try again later.'
                        : 'Could not start the demo. Please try again.'
                )
            window.location.assign('/play')
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not start the demo.'
            )
            setBusy(false)
        }
    }
    return (
        <main style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
            <HeadLayout title='Try TofuTracker' />
            <Card>
                <Space
                    direction='vertical'
                    size='large'
                    style={{ width: '100%' }}
                >
                    <Title level={1}>Try TofuTracker</Title>
                    <Paragraph>
                        A learning and assessment app with course authoring,
                        practice questions and human review of written answers.
                        No signup required.
                    </Paragraph>
                    <Paragraph>
                        Start with a short reliability quiz, explore the sample
                        course, or use the administrator tools to edit a deck
                        and review a sample written response.
                    </Paragraph>
                    <Alert
                        type='info'
                        message='Your own temporary workspace'
                        description='Changes are saved in your workspace for one hour. Reset removes your sample data. Please use fictional information. Email delivery and real account registration are unavailable in this demo.'
                    />
                    {error && <Alert type='error' message={error} />}
                    <Button
                        type='primary'
                        size='large'
                        aria-label='Start demo'
                        loading={busy}
                        onClick={start}
                    >
                        Start demo
                    </Button>
                </Space>
            </Card>
        </main>
    )
}
export async function getServerSideProps() {
    return visitorEnabled ? { props: {} } : { notFound: true }
}
