import { Alert, Button, Space, Typography } from 'antd'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function DemoControls() {
    const { status } = useSession()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    if (process.env.NEXT_PUBLIC_VISITOR_DEMO !== 'true') return null
    const reset = async () => {
        setBusy(true)
        setError('')
        try {
            const response = await fetch('/api/demo/session', {
                method: 'DELETE',
            })
            if (!response.ok)
                throw new Error('Could not reset the demo. Please try again.')
            window.location.assign('/demo')
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not reset the demo.'
            )
            setBusy(false)
        }
    }
    return (
        <Space direction='vertical' style={{ width: '100%', marginBottom: 20 }}>
            <Alert
                type='info'
                message='Personal demo workspace'
                description={
                    <Space wrap>
                        <Typography.Text>
                            Your sample data is separate from other visitors and
                            expires after one hour. Use fictional data only.
                        </Typography.Text>
                        <Link href='/demo'>Demo guide</Link>
                        {status === 'authenticated' ? (
                            <Button
                                aria-label='Reset demo'
                                loading={busy}
                                onClick={reset}
                            >
                                Reset demo
                            </Button>
                        ) : (
                            <Link href='/demo'>Start demo</Link>
                        )}
                    </Space>
                }
            />
            {error && <Alert type='error' message={error} />}
        </Space>
    )
}
