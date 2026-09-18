/**
 * Authentication configuration
 */
import React from 'react'

export interface AuthEnabledComponentConfig {
    authenticationEnabled: boolean
}

//https://github.com/nextauthjs/next-auth/issues/1210

/**
 * A component with authentication configuration
 */
export type ComponentWithAuth<PropsType = any> = React.FC<PropsType> &
    AuthEnabledComponentConfig
