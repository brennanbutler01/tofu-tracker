import TrackCourseSelect from '@/components/learningTracks/TrackCourseSelect'
import { useEffect, useState } from 'react'
import { Col, Form, Space } from 'antd'
import { SelectContainer } from '@/decks/DeckCategories'
import styled from 'styled-components'
import { http } from '@/services/http'
import PerformanceByCourseChart, {
    ICourseChartData,
} from '@/components/metrics/PerformanceByCourse/PerformanceByCourseChart'
const { Item } = Form

const StyledSelectContainer = styled(SelectContainer)`
    &&& .ant-select {
        width: 100%;
    }
`

type CourseArray = Record<'courses', Array<string>>

const PerformanceByCourse = () => {
    const [value, setValue] = useState<Array<string>>([])

    const [data, setData] = useState<Array<ICourseChartData>>([])
    const [form] = Form.useForm<CourseArray>()

    const fetchCourseData = async ({ courses }: CourseArray) => {
        await http
            .get<ICourseChartData[]>(
                `/metrics/courses/${courses.map(course => `${course}/`)}`
            )
            .then(res => setData(res.data))
            .catch(err => setData([]))
    }

    return (
        <div style={{ width: '100%' }}>
            <Space style={{ width: '100%' }} direction={'vertical'}>
                <StyledSelectContainer>
                    <Col span={24}>
                        <Form onValuesChange={fetchCourseData} form={form}>
                            <Item noStyle name={'courses'}>
                                <TrackCourseSelect
                                    value={value}
                                    onChange={setValue}
                                />
                            </Item>
                        </Form>
                    </Col>
                </StyledSelectContainer>
                <PerformanceByCourseChart data={data} />
            </Space>
        </div>
    )
}
export default PerformanceByCourse
