import { Segmented } from 'antd'
import styled from 'styled-components'
import React from 'react'

export const SegmentWrapper = styled.div`
    display: flex;
    //justify-content: center;
    .ant-segmented-item-label {
        color: ${props => props.theme['disabled-color']};
    }

    &&& {
        .ant-segmented {
            list-style-image: none;
            color: rgba(232, 230, 227, 0.65);
            background-color: rgba(0, 0, 0, 0.04);
        }
        .ant-segmented-item-selected {
            background-color: rgb(24, 26, 27);
            box-shadow: rgba(0, 0, 0, 0.05) 0 2px 8px -2px,
                rgba(0, 0, 0, 0.07) 0px 1px 4px -1px,
                rgba(0, 0, 0, 0.08) 0px 0px 1px 0px;
            color: rgb(208, 204, 198);
        }
        .ant-segmented-item:hover,
        .ant-segmented-item:focus {
            color: rgb(208, 204, 198);
        }
    }
`

const segmentedOptions = ['All', 'Correct', 'Incorrect', 'Needs Graded']
export type AnswerFilter = typeof segmentedOptions[number]

interface IResultsSegment {
    setOption: (key: AnswerFilter) => void
}

const ResultsSegment = ({ setOption }: IResultsSegment) => {
    return (
        <SegmentWrapper>
            <Segmented
                options={segmentedOptions}
                key={'viewOptions'}
                onChange={key => setOption(key as AnswerFilter)}
            />
        </SegmentWrapper>
    )
}
export default ResultsSegment
