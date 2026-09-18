import { Col, InputNumber, Row, Slider } from 'antd'
import React from 'react'

interface IQuestionSlider {
    value: number
    onChange: React.Dispatch<React.SetStateAction<number>>
    max: number
}

const QuestionSlider = ({ max, value, onChange }: IQuestionSlider) => {
    return (
        <Row>
            <Col span={24} sm={20}>
                <Slider min={1} value={value} onChange={onChange} max={max} />
            </Col>
            <Col span={24} sm={4}>
                <InputNumber
                    min={1}
                    max={max}
                    value={value}
                    onChange={val => val && onChange(val)}
                />
            </Col>
        </Row>
    )
}

export default QuestionSlider
