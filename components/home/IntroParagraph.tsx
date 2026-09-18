import { Typography } from 'antd'
import styled from 'styled-components'

const { Paragraph } = Typography

const StyledParagraph = styled(Paragraph)`
    font-size: 1rem;
`

const IntroParagraph = () => {
    return (
        <>
            <StyledParagraph>
                The Tofu Tracker originates from discussions the D15 APD QA team
                had surrounding methods to promote knowledge retention and
                revolutionize how ODHS provides training.
            </StyledParagraph>
            <StyledParagraph>
                The Tofu Tracker allows for employees to customize their
                learning experience: picking what they would like to learn and
                when! By tracking employee responses and progress, metrics
                surrounding knowledge gaps should be evident more quickly and
                allow us to focus training resources on the areas that need
                attention most urgently.
            </StyledParagraph>
            <StyledParagraph>
                Thank you for your participation and please reach out to the D15
                APD QA team with any requests for improvements or concerns.
            </StyledParagraph>
        </>
    )
}

export default IntroParagraph
