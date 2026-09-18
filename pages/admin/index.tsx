import {
    AnswersToGrade,
    getAnswersToGrade,
} from '@/pages/api/toGrade/[...cursor]'
import { PageHeader, Typography } from 'antd'
import { deserialize, serialize } from '@/utils/serialize.utils'

import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import AdminTabs from '@/components/admin/AdminTabs'
import AppLayout from '@/components/AppLayout'
import { GetServerSideProps } from 'next'
import HeadLayout from '@/components/HeadLayout'
import { LeftOutlined } from '@ant-design/icons'
import React from 'react'
import { SuperJSONResult } from 'superjson/dist/types'
import { Roles, User } from '@prisma/client'
import { getInitialAnswersToGrade } from '@/pages/api/toGrade'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../server/authOptions'
import { getUsers } from '@/pages/api/users'
import { useGradeAnswersSWR } from '@/services/toGrade/useGradeAnswersSWR'
import { useRouter } from 'next/router'
import { useUsersSWR } from '@/services/users/useUsersSWR'

const { Title } = Typography

interface IAdmin {
    answersToGrade: SuperJSONResult
    users: SuperJSONResult
}

const Index = ({ answersToGrade, users }: IAdmin) => {
    const { push } = useRouter()
    const ourAnswersToGrade = deserialize<Array<AnswersToGrade>>(answersToGrade)
    const games = useGradeAnswersSWR({ fallbackData: ourAnswersToGrade })
    const ourUsers = useUsersSWR(deserialize<Array<User>>(users))

    return (
        <>
            <HeadLayout title='Admin' />
            <AppLayout adminOnly={true}>
                <PageHeader
                    onBack={async () => await push('/decks')}
                    title={
                        <Title
                            level={1}
                            style={{
                                marginBottom: 0,
                                wordWrap: 'normal',
                                whiteSpace: 'normal',
                            }}
                        >
                            Admin
                        </Title>
                    }
                    backIcon={<LeftOutlined />}
                    footer={<AdminTabs />}
                    breadcrumb={<AdminBreadcrumb />}
                />
            </AppLayout>
        </>
    )
}
export default Index

// noinspection JSUnusedGlobalSymbols
export const getServerSideProps: GetServerSideProps = async context => {
    let answersToGrade: Array<AnswersToGrade> = []
    let users: Array<User> = []
    const session = await getServerSession(context.req, context.res, authOptions)
    if (session?.user?.role !== Roles.ADMIN) return { notFound: true }
    try {
        answersToGrade = await getInitialAnswersToGrade()
        users = await getUsers()
    } catch (err) {
        console.log('Error getting answers to grade', err)
    }
    return {
        props: {
            answersToGrade: serialize(answersToGrade),
            users: serialize(users),
            session,
        },
    }
}
