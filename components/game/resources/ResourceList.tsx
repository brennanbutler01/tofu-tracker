import { Button, Empty, List } from 'antd'
import styled from 'styled-components'
import FeedbackResourceForm from '@/components/game/resources/FeedbackResourceForm'
import { useState } from 'react'
import FadeIn from 'react-fade-in'
import { useGamesSWR } from '@/services/games/useGamesSWR'
import { useRouter } from 'next/router'
import { useFeedbackSWR } from '@/services/feedback/useFeedbackSWR'
import { Prisma } from '@prisma/client'
import ResourceItem from '@/components/game/resources/ResourceItem'
import { useGameTypeData } from '@/services/useGameTypeData'
import { QuizProps } from '../Quiz'

export type { ResourceWithComments } from '@/server/feedbackShapes'

const ListDiv = styled.div`
    .ant-list-footer {
        display: flex;
        justify-content: center;
    }
`

const ResourceList = ({ type }: QuizProps) => {
    const [formVisible, setFormVisible] = useState(false)
    const toggleFormVisibility = () => setFormVisible(!formVisible)

    const session = useGameTypeData({ type })
    const feedback = useFeedbackSWR(
        session?.questions?.[session?.currentQuestion - 1]?.id
    )

    return (
        <ListDiv>
            <List
                dataSource={feedback?.resources}
                locale={{
                    emptyText: (
                        <Empty description={'No Resources'}>
                            <Button onClick={toggleFormVisibility}>
                                {formVisible ? 'Hide' : 'Add'} Resource
                                {formVisible ? ' Form' : ''}
                            </Button>
                        </Empty>
                    ),
                }}
                itemLayout={'vertical'}
                renderItem={item => (
                    <ResourceItem
                        item={item}
                        questionId={
                            session?.questions?.[session?.currentQuestion - 1]
                                ?.id
                        }
                    />
                )}
                footer={
                    feedback?.resources?.length === 0 ? null : (
                        <Button
                            block
                            type={'dashed'}
                            onClick={toggleFormVisibility}
                        >
                            {formVisible ? 'Hide' : 'View'} Resource Form
                        </Button>
                    )
                }
            />
            {formVisible && (
                <FadeIn>
                    <FeedbackResourceForm visible={formVisible} type={type} />
                </FadeIn>
            )}
        </ListDiv>
    )
}

export default ResourceList
