// Email HTML body
export const html = ({
    url,
    host,
    email,
}: Record<'url' | 'host' | 'email', string>) => {
    // Insert invisible space into domains and email address to prevent both the
    // email address and the domain from being turned into a hyperlink by email
    // clients like Outlook and Apple mail, as this is confusing because it seems
    // like they are supposed to click on their email address to sign in.
    const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`
    const escapedHost = `${host.replace(/\./g, '&#8203;.')}`
    const firstHalf = url.substring(0, Math.floor(url.length / 2))
    const secondHalf = url.substring(Math.floor(url.length / 2))

    // Some simple styling options
    const backgroundColor = '#f9f9f9'
    const textColor = '#444444'
    const mainBackgroundColor = '#ffffff'
    const buttonBackgroundColor = '#346df1'
    const buttonBorderColor = '#346df1'
    const buttonTextColor = '#ffffff'

    return `
<body style="background: ${backgroundColor};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        <strong>${escapedHost}</strong>
      </td>
    </tr>
  </table>
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        Sign in as <strong>${escapedEmail}</strong>
      </td>
    </tr>
    <tr>
    This is our URL~!!!!! 
    Copy and paste the pieces to form one url.
    
    ${url}
    </tr>
  </table>
</body>
`
}
// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
export const text = ({ url, host }: Record<'url' | 'host', string>) =>
    `Sign in to ${host}\n${url}\n\n`
