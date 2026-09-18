import { StyledTag } from '@/decks/DeckTags'
import {
    Button,
    Col,
    Dropdown,
    Grid,
    List,
    Menu,
    Modal,
    Row,
    Space,
    Tooltip,
    Typography,
} from 'antd'
import AvatarWithFallback from '@/components/game/AvatarWithFallback'
import styled, { useTheme } from 'styled-components'
import { Roles, Teams, User } from '@prisma/client'
import { useUsersCRUD } from '@/services/users/useUsersCRUD'
import { DeleteOutlined } from '@ant-design/icons'
const {
        Item,
        Item: { Meta },
    } = List,
    { Text } = Typography

const MenuWrapper = styled.div`
    &&& {
        .ant-dropdown-menu-item:hover {
            background-color: ${props => props.theme['tofu-brand-3']};
        }
        .ant-dropdown-menu-item.ant-dropdown-menu-item-active {
            background-color: ${props => props.theme['tofu-green-background']};
        }
    }
`

interface IUserListItem {
    item: User
}
const UserListItem = ({ item }: IUserListItem) => {
    const theme = useTheme()
    const breakpoint = Grid.useBreakpoint()
    const { changeUserRole, deleteUser, changeUserTeam } = useUsersCRUD()

    return (
        <Item
            key={item.id}
            extra={
                <Space direction={'vertical'}>
                    <Space style={{ marginTop: '16px' }}>
                        <Tooltip title={item.team} key={'team'}>
                            <StyledTag key={'team'}>{item.team}</StyledTag>
                        </Tooltip>
                        <StyledTag
                            key={'role'}
                            color={
                                item.role === Roles.ADMIN
                                    ? theme['tofu-blood']
                                    : theme['tofu-green-background']
                            }
                        >
                            {item.role}
                        </StyledTag>
                    </Space>
                </Space>
            }
            actions={[
                <Space key={'actions'}>
                    <Button
                        size={'small'}
                        key={'promote'}
                        shape={'round'}
                        onClick={async () => {
                            Modal.confirm({
                                title: "Are you sure you want to change this user's authorized role?",
                                content: (
                                    <>
                                        <Text>This user was a </Text>
                                        <StyledTag
                                            color={theme['tofu-brand-4']}
                                        >
                                            {item.role}
                                        </StyledTag>
                                        <Text>and will now be a </Text>
                                        <StyledTag
                                            color={theme['tofu-brand-4']}
                                        >
                                            {item.role === Roles.USER
                                                ? Roles.ADMIN
                                                : Roles.USER}
                                        </StyledTag>
                                    </>
                                ),
                                type: 'confirm',
                                okText: 'Yes',
                                cancelText: 'No',
                                maskClosable: true,
                                onOk: async () =>
                                    await changeUserRole({
                                        id: item.id,
                                        role: item.role,
                                    }),
                            })
                        }}
                    >
                        {item.role === Roles.USER ? 'Make Admin' : 'Make User'}
                    </Button>
                    <MenuWrapper key={'changeTeam'}>
                        <Dropdown.Button
                            size={'small'}
                            getPopupContainer={el =>
                                el.parentNode as HTMLElement
                            }
                            overlay={
                                <Menu
                                    onClick={async ({ key }) =>
                                        await changeUserTeam({
                                            id: item.id,
                                            team: key as Teams,
                                        })
                                    }
                                    activeKey={item.team}
                                    items={Object.keys(Teams).map(team => ({
                                        label: team,
                                        key: team,
                                    }))}
                                />
                            }
                        >
                            Reassign
                        </Dropdown.Button>
                    </MenuWrapper>
                    <Tooltip title={'Delete User'} key={'delete'}>
                        <DeleteOutlined
                            key={'delete'}
                            onClick={async () => {
                                Modal.confirm({
                                    title: `Are you sure you want to delete user ${item.email}?`,
                                    okText: 'Yes',
                                    cancelText: 'No',
                                    onOk: async () => await deleteUser(item.id),
                                    maskClosable: true,
                                })
                            }}
                        />
                    </Tooltip>
                </Space>,
            ]}
        >
            <Meta
                {...(item.name && { title: <Text ellipsis>{item.name}</Text> })}
                avatar={<AvatarWithFallback user={item} />}
                description={<Text ellipsis>{item.email}</Text>}
            />
        </Item>
    )
}
export default UserListItem
