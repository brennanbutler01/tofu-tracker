import { Typography } from 'antd'
import styled from 'styled-components'
import Typewriter from 'typewriter-effect'

const { Paragraph } = Typography

const UnderlineSpan = styled.span`
    text-decoration: underline;
`

const IntroTypewriter = () => {
    return (
        <Paragraph style={{ fontSize: '1.75rem' }}>
            A comprehensive retention support platform tailor-made in District
            15 APD for all roles:
            <UnderlineSpan>
                <Typewriter
                    options={{
                        autoStart: true,
                        strings: [
                            'Case Managers',
                            'Eligibility Specialists',
                            'Administrative Staff',
                        ],
                        loop: true,
                    }}
                />
            </UnderlineSpan>
        </Paragraph>
    )
}

export default IntroTypewriter
