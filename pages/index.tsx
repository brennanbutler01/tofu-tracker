import AppLayout from '@/components/AppLayout'
import HeadLayout from '@/components/HeadLayout'
import HomeComponent from '@/components/home'

const Home = () => {
    return (
        <div>
            <HeadLayout />
            <AppLayout adminOnly={false}>
                <HomeComponent />
            </AppLayout>
        </div>
    )
}

export default Home
