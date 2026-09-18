import { Grid } from 'antd'
import Link from 'next/link'
import Image from 'next/image'

export const authImage: Record<
    'mobile' | 'fullSize',
    { src: string; width: number; height: number }
> = {
    mobile: {
        src: '/logo-250x150.png',
        width: 250,
        height: 150,
    },
    fullSize: {
        src: '/logo-500x300.png',
        width: 500,
        height: 300,
    },
}

export const AuthImage = () => {
    const breakpoint = Grid.useBreakpoint()
    return (
        <Link legacyBehavior
            href={typeof window === 'undefined' ? '' : window?.location?.origin}
        >
            <a
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Image
                    {...(breakpoint.sm
                        ? authImage['fullSize']
                        : authImage['mobile'])}
                    alt={'tofu tracker logo - a piece of tofu'}
                />
            </a>
        </Link>
    )
}
