import { Col, Form, FormInstance, Input, InputRef, Modal, Row } from 'antd'
import React from 'react'
import { CreateGameSessionType } from '@/services/games/useGameCRUD'
import { QuestionWithOptions } from '@/pages/decks/[id]'
import cuid from 'cuid'
const { Item } = Form

interface IGameTitleModal {
    form: FormInstance
    questions: Array<QuestionWithOptions>
    setLoadingGame: React.Dispatch<React.SetStateAction<boolean>>
    push: (url: string) => Promise<boolean>
    createGameSession: CreateGameSessionType
    ref: React.RefObject<InputRef>
}

export const GameTitleModal = ({
    form,
    questions,
    setLoadingGame,
    push,
    createGameSession,
    ref,
}: IGameTitleModal) => {
    return Modal.info({
        title: 'Please give your game a name',
        okButtonProps: {
            htmlType: 'submit',
            form: 'title-form',
        },
        maskClosable: true,
        content: (
            <Form
                name={'title-form'}
                form={form}
                onFinish={async val => {
                    setLoadingGame(true)
                    const id = cuid()
                    const createdId = await createGameSession({
                        id,
                        title: val.title,
                        questions,
                    })
                    if (createdId) await push(`/play/game/${createdId}`)
                    setLoadingGame(false)
                }}
            >
                <Row>
                    <Col span={16}>
                        <Item
                            style={{ marginBottom: 0 }}
                            name={'title'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please add a title',
                                },
                            ]}
                        >
                            <Input placeholder={'Game Title'} ref={ref} />
                        </Item>
                    </Col>
                </Row>
            </Form>
        ),
    })
}
