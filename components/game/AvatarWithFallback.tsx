import { User } from '@prisma/client'
import { Avatar } from 'antd'
import styled from 'styled-components'

interface ICommentAvatar {
    user: Pick<User, 'name' | 'image'>
}

const AvatarContainer = styled.div`
    &&& {
        .ant-avatar {
            background-color: ${props => props.theme['tofu-brand-5']};
            font-weight: bold;
            font-size: 16px;
        }
    }
`

const AvatarWithFallback = ({ user }: ICommentAvatar) => {
    const name = user?.name ? user?.name[0].toUpperCase() : 'U'
    return (
        <AvatarContainer>
            <Avatar src={user?.image} icon={<Avatar>{name}</Avatar>} />
        </AvatarContainer>
    )
}

export default AvatarWithFallback
