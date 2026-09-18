import { Button, Col, Form, Input, Row, Space, Typography } from 'antd'
import {
    MinusCircleOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons'
import FormLabel from '@/components/FormLabel'
import React from 'react'
import { useTheme } from 'styled-components'
const { List, Item } = Form,
    { Text } = Typography

interface IMultipleOptions {
    editing?: string
}

const MultipleOptionsForm: React.FC<IMultipleOptions> = ({ editing = '' }) => {
    const firstItemNotEditing = (index: number) => index === 0 && !editing
    const theme = useTheme()
    return (
        <Row>
            <Col span={24}>
                <Item label={<FormLabel label={'Question'} />}>
                    <Text style={{ color: theme['tofu-text'] }}>{editing}</Text>
                </Item>
            </Col>
            <Col span={16}>
                <Item label={<FormLabel label={'Options'} />}>
                    <List
                        name='options'
                        initialValue={[{ text: 'New Option' }]}
                    >
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(
                                    ({ key, name, ...restField }, index) => (
                                        <Col
                                            key={key}
                                            span={24}
                                            style={{
                                                alignItems: 'baseline',
                                                display: 'flex',
                                                gap: '10px',
                                            }}
                                        >
                                            <Item
                                                {...restField}
                                                name={[name, 'text']}
                                                rules={[
                                                    {
                                                        required: !editing,
                                                        message:
                                                            'Missing option text',
                                                    },
                                                ]}
                                                {...(firstItemNotEditing(
                                                    index
                                                ) && {
                                                    label: (
                                                        <FormLabel
                                                            label={'Options'}
                                                        />
                                                    ),
                                                    help: 'The options from which the user will choose to answer the question',
                                                    tooltip: {
                                                        title: (
                                                            <div>
                                                                These are the
                                                                options a user
                                                                can choose from
                                                                to answer this
                                                                question
                                                            </div>
                                                        ),
                                                        icon: (
                                                            <QuestionCircleOutlined />
                                                        ),
                                                    },
                                                })}
                                            >
                                                <Input placeholder='Option Text' />
                                            </Item>
                                            {(editing
                                                ? index >= 0
                                                : index > 1) && (
                                                <MinusCircleOutlined
                                                    onClick={() => remove(name)}
                                                />
                                            )}
                                        </Col>
                                    )
                                )}
                                <Col span={16}>
                                    <Item>
                                        <Button
                                            type='dashed'
                                            onClick={() => add()}
                                            icon={<PlusOutlined />}
                                        >
                                            Add Option
                                        </Button>
                                    </Item>
                                </Col>
                            </>
                        )}
                    </List>
                </Item>
            </Col>
        </Row>
    )
}

export default MultipleOptionsForm
