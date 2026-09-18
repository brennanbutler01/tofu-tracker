import Head from 'next/head'

interface IHeadLayout {
    title?: string
}

const HeadLayout = ({ title }: IHeadLayout) => {
    return (
        <Head>
            <title>{title} Tofu - Tracker</title>
            <link rel='icon' href='/favicon.ico' />
        </Head>
    )
}

export default HeadLayout
