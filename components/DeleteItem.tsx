import React from 'react'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Modal, Tooltip } from 'antd'
import { Models } from '@/utils/message.utils'

const { confirm } = Modal

interface IDeleteItem {
    onDelete: () => Promise<void | boolean>
    model: Models
    button?: boolean
    textButton?: boolean
}

const showDeleteConfirm = ({ onDelete, model }: IDeleteItem) => {
    return confirm({
        title: (
            <>
                Are you sure that you want to delete this{' '}
                <span>{model[0] + model.slice(1).toLowerCase()}</span>?
            </>
        ),
        icon: <ExclamationCircleOutlined />,
        onOk: async () => {
            if ((await onDelete()) === false)
                throw new Error('The item could not be removed')
        },
        onCancel: () => Modal.destroyAll(),
    })
}

const DeleteItem = ({
    onDelete,
    model,
    button = false,
    textButton = false,
}: IDeleteItem) => {
    return button ? (
        <Button
            danger
            icon={!textButton ? <DeleteOutlined /> : null}
            onClick={() => showDeleteConfirm({ onDelete, model })}
            type={textButton ? 'text' : 'default'}
        >
            Delete
        </Button>
    ) : (
        <Tooltip overlay={'Delete'}>
            <DeleteOutlined
                key={'delete'}
                onClick={() => showDeleteConfirm({ onDelete, model })}
            />
        </Tooltip>
    )
}
export default DeleteItem
