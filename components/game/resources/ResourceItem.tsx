import { ResourceWithComments } from '@/components/game/resources/ResourceList'
import { Button, Form, Input, List, Skeleton, Space, Tooltip } from 'antd'
import AvatarWithFallback from '@/components/game/AvatarWithFallback'
import { HoverSpan, useLikes } from '@/utils/useLikes'
import { useFeedbackCRUD } from '@/services/feedback/useFeedbackCRUD'
import { CommentOutlined, EditOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { IResourceForm } from '@/components/game/resources/FeedbackResourceForm'
import ResourceComments from '@/components/game/ResourceComments'

const {
    Item,
    Item: { Meta },
} = List

export interface IResourceItem {
    item: ResourceWithComments
}

const ItemWrapper = styled.div`
        .ant-list-item-action-split {
            background-color: ${props => props.theme['tofu-brand-7']};
        }

        .ant-input {
            border-radius: 2px;
        }
    `,
    StyledListItem = styled(Item)`
        &&& {
            border-bottom: 1px solid ${props => props.theme['tofu-brand-5']} !important;
        }
    `

const ResourceItem = ({
    item,
    questionId,
}: IResourceItem & { questionId: string }) => {
    const { likeDislikeResource, editQuestionResource } =
        useFeedbackCRUD(questionId)
    const { data: session } = useSession()

    const { actions: likeActions } = useLikes({
        source: item,
        likeFunction: likeDislikeResource,
    })

    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const [commentsVisible, setCommentsVisible] = useState(false)

    const cancelEditing = () => {
        setEditing(false)
        form.resetFields()
    }

    const startEditing = () => {
        setEditing(true)
        form.setFieldsValue({
            location: item.location,
            title: item.title,
            description: item.description,
        })
    }

    const saveEdit = async (val: IResourceForm) => {
        setLoading(true)
        if (
            await editQuestionResource({
                ...val,
                resourceId: item.id,
                tags: item.tags,
            })
        )
            setEditing(false)
        setLoading(false)
    }

    return (
        <ItemWrapper>
            <StyledListItem
                key={item.id}
                actions={[
                    ...(session?.user?.userId === item.userId
                        ? [
                              editing ? (
                                  <Space style={{ marginTop: '10px' }}>
                                      <Form.Item noStyle>
                                          <Button
                                              size={'small'}
                                              onClick={cancelEditing}
                                              danger
                                              htmlType={'reset'}
                                              form={'resourceForm'}
                                              loading={loading}
                                          >
                                              Cancel
                                          </Button>
                                      </Form.Item>
                                      <Form.Item noStyle>
                                          <Button
                                              size={'small'}
                                              type={'primary'}
                                              htmlType={'submit'}
                                              form={'resourceForm'}
                                              loading={loading}
                                          >
                                              Confirm
                                          </Button>
                                      </Form.Item>
                                  </Space>
                              ) : (
                                  <Tooltip title={'edit'} key={'edit'}>
                                      <HoverSpan>
                                          <EditOutlined
                                              onClick={startEditing}
                                          />
                                      </HoverSpan>
                                  </Tooltip>
                              ),
                              ...likeActions,
                              <Tooltip title={'View Comments'} key={'comments'}>
                                  <CommentOutlined
                                      onClick={() =>
                                          setCommentsVisible(!commentsVisible)
                                      }
                                  />
                              </Tooltip>,
                          ]
                        : []),
                ]}
            >
                <Form<IResourceForm>
                    form={form}
                    name={'resourceForm'}
                    onFinish={saveEdit}
                >
                    <Skeleton loading={loading} active={true} avatar={true}>
                        <Meta
                            avatar={<AvatarWithFallback user={item.user} />}
                            title={
                                editing ? (
                                    <Space direction={'vertical'}>
                                        <Form.Item
                                            style={{ marginBottom: 0 }}
                                            name={'title'}
                                            label={'Title'}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'Enter a title for the resource.',
                                                },
                                            ]}
                                        >
                                            <Input placeholder={'title'} />
                                        </Form.Item>
                                        <Form.Item
                                            style={{ marginBottom: 0 }}
                                            name={'location'}
                                            label={'Location'}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'Enter a resource location.',
                                                },
                                            ]}
                                        >
                                            <Input placeholder={'location'} />
                                        </Form.Item>
                                    </Space>
                                ) : (
                                    <a
                                        href={`https://${item.location}`}
                                        rel={'noreferrer'}
                                        target={'_blank'}
                                    >
                                        {item.title}
                                    </a>
                                )
                            }
                            description={
                                editing ? (
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name={'description'}
                                        label={'Description'}
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Enter a description',
                                            },
                                        ]}
                                    >
                                        <Input.TextArea
                                            value={item.description}
                                            placeholder={'Description'}
                                        />
                                    </Form.Item>
                                ) : (
                                    item.description
                                )
                            }
                        />
                    </Skeleton>
                </Form>
            </StyledListItem>
            {commentsVisible && (
                <ResourceComments item={item} questionId={questionId} />
            )}
        </ItemWrapper>
    )
}

export default ResourceItem
