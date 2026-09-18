import { Button, List } from 'antd'
import { StyledCard } from '@/components/game/QuizCard'
import React from 'react'
const { Item } = List

export enum Query {
    AnswersByDay,
    None,
    Courses,
    QuestionStats,
}

interface IQueryList {
    setCurrentQuery: React.Dispatch<React.SetStateAction<Query>>
}

const QueryList = ({ setCurrentQuery }: IQueryList) => {
    const queryList = [
        {
            setQuery: () => setCurrentQuery(Query.AnswersByDay),
            title: 'User Performance by Day',
        },
        {
            setQuery: () => setCurrentQuery(Query.Courses),
            title: 'Performance by Course',
        },
        {
            setQuery: () => setCurrentQuery(Query.QuestionStats),
            title: 'Stats by Question',
        },
    ]
    return (
        <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xxl: 5 }}
            dataSource={queryList}
            renderItem={query => (
                <Item key={query.title}>
                    <StyledCard>
                        <Button block onClick={query.setQuery}>
                            {query.title}
                        </Button>
                    </StyledCard>
                </Item>
            )}
        />
    )
}

export default QueryList
