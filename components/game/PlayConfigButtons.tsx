import { Button, Grid, Space, Typography } from 'antd'
import { PlayCircleOutlined, SettingOutlined } from '@ant-design/icons'
const { Text } = Typography

interface IButtons {
    questionsEmpty: boolean
    startGame: () => Promise<void>
    toggleConfiguration: () => void
    loading: boolean
}

const PlayConfigButtons = ({
    questionsEmpty,
    startGame,
    toggleConfiguration,
    loading,
}: IButtons) => {
    const breakpoint = Grid.useBreakpoint()
    return (
        <Space direction={'vertical'}>
            {breakpoint.xs && (
                <Text type={'secondary'}>
                    {questionsEmpty
                        ? 'Please create a question for a deck in order to play a game!'
                        : 'Click the play game button to begin! '}
                </Text>
            )}
            {!questionsEmpty && (
                <Space>
                    <Button
                        size={breakpoint.xs ? 'small' : 'middle'}
                        type={'primary'}
                        icon={<PlayCircleOutlined />}
                        onClick={startGame}
                        loading={loading}
                    >
                        Start Game
                    </Button>
                    <Button
                        size={breakpoint.xs ? 'small' : 'middle'}
                        loading={loading}
                        icon={<SettingOutlined />}
                        onClick={toggleConfiguration}
                    >
                        Configure Game
                    </Button>
                </Space>
            )}
        </Space>
    )
}
export default PlayConfigButtons
