// noinspection JSUnusedGlobalSymbols

import { getSession, useSession } from 'next-auth/react'

import AppLayout from '@/components/AppLayout'
import { GetServerSidePropsContext } from 'next'
import HeadLayout from '@/components/HeadLayout'
import {
    Button,
    Card,
    Col,
    Collapse,
    Form,
    Grid,
    Input,
    PageHeader,
    Row,
    Skeleton,
    Space,
    Statistic,
    Switch,
    Typography,
} from 'antd'
import { CorrectStatus, User } from '@prisma/client'
import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../server/authOptions'
import { useRouter } from 'next/router'
import prisma from '@/prisma/prisma'
import { deserialize, serialize } from '@/utils/serialize.utils'
import { SuperJSONResult } from 'superjson/dist/types'
import { StyledCard } from '@/components/game/QuizCard'
import FormLabel from '@/components/FormLabel'
import { StyledTag } from '@/components/decks/DeckTags'
import { useUsersCRUD } from '@/services/users/useUsersCRUD'
import { useState } from 'react'
import { useSingleUserSWR } from '@/services/users/useSingleUserSWR'
import { CollapseWrapper } from '@/components/game/QuizResults'
import { SwitchContainer } from '@/components/questions/QuestionForm'
import styled from 'styled-components'

const { Title, Text } = Typography,
    { Meta } = Card,
    { Item } = Form,
    { Panel } = Collapse

interface IProfile {
    session: Session
    user: SuperJSONResult
    userStats: SuperJSONResult
    needsGraded: SuperJSONResult
    coursesPassed: SuperJSONResult
}

interface IProfileForm {
    email: string
    name: string
    editing: boolean
}

interface IUserStats {
    incorrect: number
    correct: number
}

interface INeedsGraded {
    needsGraded: number
}

interface ICoursesPassed {
    coursesPassed: number
}

const StyledSwitchWrapper = styled(SwitchContainer)`
        &&& {
            .ant-switch-checked .ant-switch-inner {
                color: ${props => props.theme['tofu-brand-2']};
            }
        }
    `,
    TextWrap = styled.div`
        &&& {
            .ant-card-meta-title {
                white-space: normal;
            }
        }
    `

const Profile = ({
    session,
    user,
    coursesPassed,
    needsGraded,
    userStats,
}: IProfile) => {
    const { data } = useSession()
    const { back } = useRouter()
    const deserializedUser = deserialize<User>(user)
    const ourUser = useSingleUserSWR({
        id: deserializedUser?.id,
        fallbackData: deserializedUser,
    })
    const deserializedCoursesPassed =
        deserialize<Array<ICoursesPassed>>(coursesPassed)
    const deserializedNeedsGraded =
        deserialize<Array<INeedsGraded>>(needsGraded)
    const deserializedUserStats = deserialize<Array<IUserStats>>(userStats)

    const [form] = Form.useForm<IProfileForm>()
    const { updateProfile } = useUsersCRUD()
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const breakpoint = Grid.useBreakpoint()

    return (
        <div>
            <HeadLayout title='Profile' />
            <AppLayout adminOnly={false}>
                <PageHeader
                    onBack={back}
                    title={
                        <Space style={{ width: '100%' }} direction='vertical'>
                            <Title
                                level={1}
                                style={{
                                    marginBottom: 0,
                                    whiteSpace: 'normal',
                                    wordWrap: 'normal',
                                }}
                            >
                                Profile
                            </Title>
                            {breakpoint.xs && (
                                <Title
                                    level={3}
                                    type='secondary'
                                    style={{ whiteSpace: 'normal' }}
                                >
                                    Update and confirm your contact information
                                </Title>
                            )}
                        </Space>
                    }
                    {...(breakpoint.sm && {
                        subTitle: 'Update and confirm your contact information',
                    })}
                />
                <Row justify='center'>
                    <Col span={20} md={18} lg={14} xl={12}>
                        <Skeleton active loading={loading}>
                            <StyledCard
                                title={
                                    <Title
                                        level={3}
                                        style={{ marginBottom: 0 }}
                                    >
                                        Profile for {ourUser?.name}
                                    </Title>
                                }
                                extra={
                                    <Row
                                        justify='space-between'
                                        gutter={[24, 24]}
                                    >
                                        <Col span={24} md={12}>
                                            <Space>
                                                <StyledTag>
                                                    {ourUser?.role}
                                                </StyledTag>
                                                <StyledTag>
                                                    {ourUser?.team}
                                                </StyledTag>
                                            </Space>
                                        </Col>
                                        <Col span={24} md={12}>
                                            <StyledSwitchWrapper
                                                style={{
                                                    justifyContent: 'end',
                                                    display: 'flex',
                                                }}
                                            >
                                                <Switch
                                                    checked={editing}
                                                    onChange={checked =>
                                                        setEditing(checked)
                                                    }
                                                    checkedChildren='edit'
                                                    unCheckedChildren='view'
                                                />
                                            </StyledSwitchWrapper>
                                        </Col>
                                    </Row>
                                }
                            >
                                <TextWrap>
                                    <Meta
                                        title={
                                            <>
                                                {' '}
                                                Hi,{' '}
                                                <Text underline>
                                                    {ourUser?.name}
                                                </Text>
                                                , you can edit your profile
                                                here. Click on the switch above
                                                to toggle editing and don&apos;t
                                                forget to check out the
                                                statistics at the bottom of the
                                                page.
                                            </>
                                        }
                                        description={
                                            <>
                                                <Form<IProfileForm>
                                                    layout='vertical'
                                                    form={form}
                                                    initialValues={{
                                                        name: ourUser?.name,
                                                        email: ourUser?.email,
                                                    }}
                                                    onFinish={async val => {
                                                        setLoading(true)
                                                        const saved = await updateProfile({
                                                            name: val.name,
                                                            id: ourUser?.id,
                                                        })
                                                        setLoading(false)
                                                        if (saved) setEditing(false)
                                                    }}
                                                >
                                                    <StyledCard
                                                        type='inner'
                                                        actions={
                                                            editing
                                                                ? [
                                                                      <Item
                                                                          noStyle
                                                                          key='submit'
                                                                      >
                                                                          <Button
                                                                              type='primary'
                                                                              htmlType='submit'
                                                                          >
                                                                              Confirm
                                                                          </Button>
                                                                      </Item>,
                                                                      <Item
                                                                          noStyle
                                                                          key='reset'
                                                                      >
                                                                          <Button
                                                                              danger
                                                                              htmlType='reset'
                                                                          >
                                                                              Cancel
                                                                          </Button>
                                                                      </Item>,
                                                                  ]
                                                                : []
                                                        }
                                                    >
                                                        <Row
                                                            gutter={24}
                                                            style={{
                                                                padding: 8,
                                                            }}
                                                        >
                                                            <Col span={24}>
                                                                <Item
                                                                    label={
                                                                        <FormLabel label='Name' />
                                                                    }
                                                                    name='name'
                                                                >
                                                                    {editing ? (
                                                                        <Input placeholder='Name' />
                                                                    ) : (
                                                                        <Text>
                                                                            {
                                                                                ourUser?.name
                                                                            }
                                                                        </Text>
                                                                    )}
                                                                </Item>
                                                            </Col>
                                                            <Col span={24}>
                                                                <Item
                                                                    label={
                                                                        <FormLabel label='Email' />
                                                                    }
                                                                    name='email'
                                                                >
                                                                    {editing ? (
                                                                        <Input placeholder='Email' disabled title='Sign-in email changes require verification and are unavailable here' />
                                                                    ) : (
                                                                        <Text>
                                                                            {
                                                                                ourUser?.email
                                                                            }
                                                                        </Text>
                                                                    )}
                                                                </Item>
                                                            </Col>
                                                        </Row>
                                                    </StyledCard>
                                                </Form>
                                                <Col span={24}>
                                                    <CollapseWrapper>
                                                        <Collapse>
                                                            <Panel
                                                                header='Stats'
                                                                key='stats'
                                                            >
                                                                <Row
                                                                    gutter={[
                                                                        32, 24,
                                                                    ]}
                                                                    justify='space-around'
                                                                >
                                                                    <Col
                                                                        span={
                                                                            12
                                                                        }
                                                                    >
                                                                        <Statistic
                                                                            title='Questions Correct'
                                                                            value={
                                                                                deserializedUserStats[0]
                                                                                    .correct
                                                                            }
                                                                        />
                                                                    </Col>
                                                                    <Col
                                                                        span={
                                                                            12
                                                                        }
                                                                    >
                                                                        <Statistic
                                                                            title='Questions Incorrect'
                                                                            value={
                                                                                deserializedUserStats[0]
                                                                                    .incorrect
                                                                            }
                                                                        />
                                                                    </Col>
                                                                    <Col
                                                                        span={
                                                                            12
                                                                        }
                                                                    >
                                                                        <Statistic
                                                                            title='Questions Need Graded'
                                                                            value={
                                                                                deserializedNeedsGraded[0]
                                                                                    .needsGraded
                                                                            }
                                                                        />
                                                                    </Col>
                                                                    <Col
                                                                        span={
                                                                            12
                                                                        }
                                                                    >
                                                                        <Statistic
                                                                            title='Courses Passed'
                                                                            value={
                                                                                deserializedCoursesPassed[0]
                                                                                    .coursesPassed
                                                                            }
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </Panel>
                                                        </Collapse>
                                                    </CollapseWrapper>
                                                </Col>
                                            </>
                                        }
                                    />
                                </TextWrap>
                            </StyledCard>
                        </Skeleton>
                    </Col>
                </Row>
            </AppLayout>
        </div>
    )
}

export default Profile

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const session = await getServerSession(context.req, context.res, authOptions)
    if (!session?.user?.userId) {
        return { redirect: { destination: '/auth/signin', permanent: false } }
    }
    const userId = session.user.userId
    const [user, answers, passedCourses] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.gameAnswer.groupBy({
            by: ['isCorrect'], where: { playerId: userId }, _count: { _all: true },
        }),
        prisma.courseSession.findMany({
            where: { passed: true, isComplete: true, gameSession: { userId } },
            select: { courseId: true }, distinct: ['courseId'],
        }),
    ])
    if (!user) return { notFound: true }
    const count = (status: CorrectStatus) => answers.find(answer => answer.isCorrect === status)?._count._all ?? 0
    return {
        props: {
            session,
            user: serialize(user),
            userStats: serialize([{ correct: count(CorrectStatus.TRUE), incorrect: count(CorrectStatus.FALSE) }]),
            needsGraded: serialize([{ needsGraded: count(CorrectStatus.NEEDS_GRADED) }]),
            coursesPassed: serialize([{ coursesPassed: passedCourses.length }]),
        },
    }
}
