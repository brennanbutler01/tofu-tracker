import { Progress } from 'antd'
import { useTheme } from 'styled-components'

interface IProgress {
    percent: number
}

const ProgressBar = ({ percent }: IProgress) => {
    const theme = useTheme()

    return (
        <Progress
            percent={percent}
            strokeColor={{
                to: theme['tofu-green'],
                from: theme['tofu-green-background-hover'],
            }}
            trailColor={theme['tofu-brand-8']}
            status={'active'}
        />
    )
}

export default ProgressBar
