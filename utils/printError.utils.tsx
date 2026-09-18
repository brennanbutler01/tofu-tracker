import { IMessage, messageConfig, MessageStatus } from '@/utils/message.utils'

interface IPrintError extends Omit<IMessage, 'status'> {
    err: unknown
}

export const printError = async (props: IPrintError) => {
    console.log(
        `Error trying to ${props.operation} ${props.model}....`,
        props.err
    )
    await messageConfig({ ...props, status: MessageStatus.ERROR })
}
