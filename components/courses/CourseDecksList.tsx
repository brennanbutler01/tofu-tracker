import { Empty, List } from 'antd'
import { CourseWithDecks } from '@/pages/api/courses'
import DeleteItem from '@/components/DeleteItem'
import { Models } from '@/utils/message.utils'
import { useCoursesCRUD } from '@/services/courses/useCoursesCRUD'
import { useState } from 'react'
import CourseDeckPopover from '@/components/courses/CourseDeckPopover'
const { Item } = List

interface ICourseDecksList {
    course: CourseWithDecks
}

const CourseDecksList = ({ course }: ICourseDecksList) => {
    const { removeCourseDeck } = useCoursesCRUD()
    const [loading, setLoading] = useState(false)

    return (
        <List
            locale={{
                emptyText: (
                    <Empty description={'No Decks'}>
                        <CourseDeckPopover
                            course={course}
                            setLoading={setLoading}
                        />
                    </Empty>
                ),
            }}
            dataSource={course.decks}
            loading={loading}
            {...(course?.decks?.length > 0 && {
                footer: (
                    <CourseDeckPopover
                        course={course}
                        setLoading={setLoading}
                    />
                ),
            })}
            renderItem={deck => (
                <Item
                    key={deck.id}
                    actions={[
                        <DeleteItem
                            key={'delete'}
                            onDelete={async () => {
                                setLoading(true)
                                await removeCourseDeck({
                                    courseId: course.id,
                                    deckId: deck.id,
                                })
                                setLoading(false)
                            }}
                            model={Models.DECK}
                        />,
                    ]}
                >
                    {deck.title}
                </Item>
            )}
        />
    )
}

export default CourseDecksList
