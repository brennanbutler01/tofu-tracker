import { Button, Grid, ModalProps } from 'antd'

interface IModalProps {
    model: string
    formName: string
    onClose: () => void
    visible: boolean
    editing: boolean
}

const useConfigModal = ({
    model,
    formName,
    onClose,
    visible,
    editing,
}: IModalProps) => {
    const screens = Grid.useBreakpoint()
    return {
        okText: `${editing ? 'Edit' : 'Create'} ${model}`,
        onCancel: onClose,
        visible,
        closable: false,
        title: `${editing ? 'Edit' : 'Create'} ${model}`,
        width: screens.xs ? '360px' : '500px',
        footer: [
            <Button
                form={formName}
                htmlType={'reset'}
                type={'ghost'}
                key={'cancel'}
                onClick={onClose}
            >
                Cancel
            </Button>,
            <Button
                form={formName}
                htmlType={'submit'}
                type={'primary'}
                key={'submit'}
            >
                {editing ? 'Edit' : 'Create'} {model}
            </Button>,
        ],
    } as ModalProps
}

export default useConfigModal
