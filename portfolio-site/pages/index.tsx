import Head from 'next/head'
import Demo from '../../portfolio/Demo'
export default function Home() {
    return (
        <>
            <Head>
                <title>TofuTracker · Learning, with a little more care</title>
                <meta
                    name='description'
                    content='Try a disposable learning-management demo: practice questions, written feedback, and learner progress. Built by Brennan Butler.'
                />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1'
                />
            </Head>
            <Demo />
        </>
    )
}
