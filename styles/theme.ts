//extend and override styled components default theme for intellisense and type checking.
declare module 'styled-components' {
    // noinspection JSUnusedGlobalSymbols
    export interface DefaultTheme {
        'tofu-red': string
        'tofu-green': string
        'tofu-blue': string
        'tofu-purple': string
        'tofu-bright-orange': string
        'tofu-yellow': string
        'tofu-orange': string
        'tofu-light-blue': string
        'tofu-grey': string
        'tofu-gold': string
        'tofu-light-gold': string
        'tofu-brand-0': string
        'tofu-brand-1': string
        'tofu-brand-2': string
        'tofu-brand-3': string
        'tofu-brand-4': string
        'tofu-brand-5': string
        'tofu-brand-6': string
        'tofu-brand-7': string
        'tofu-brand-8': string
        'tofu-contrast': string
        'tofu-button-green': string
        'tofu-button-green-hover': string
        'tofu-type-grey': string
        'tofu-background-dark': string
        'tofu-rules-dark': string
        'tofu-rules-light': string
        'tofu-background-light': string
        'tofu-text-heading': string
        'tofu-text': string
        'tofu-text-secondary': string
        'disabled-color': string
        'tofu-green-background': string
        'tofu-green-background-hover': string
        'tofu-cyan': string
        'tofu-magenta': string
        'tofu-box-shadow': string
        'tofu-blood': string
    }
}

//styled component dark themes
export const darkTheme = {
    'tofu-box-shadow':
        '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    'tofu-green-background': 'rgba(0, 48, 34, 1)',
    'tofu-green-background-hover': 'rgba(0, 60, 42, .75)',
    'tofu-red': '#ff5555',
    'tofu-magenta': '#d211fe',
    'tofu-green': '#52e3c2',
    'tofu-cyan': '#8be9fd',
    'tofu-blue': '#004daa',
    'tofu-purple': '#320671',
    'tofu-bright-orange': '#ff4b12',
    'tofu-yellow': '#ffd900',
    'tofu-orange': '#ed8a19',
    'tofu-light-blue': '#40c4ff',
    'tofu-blood': '#8a0303',
    'tofu-grey': '#546e7a',
    'tofu-gold': '#efb068',
    'tofu-light-gold': '#ffebb7',
    'tofu-brand-0': '#1a1a21',
    'tofu-brand-1': '#282833',
    'tofu-brand-2': '#32323e',
    'tofu-brand-3': '#393945',
    'tofu-brand-4': '#40424f',
    'tofu-brand-5': '#4d505f',
    'tofu-brand-6': '#6e7288',
    'tofu-brand-7': '#8f94ab',
    'tofu-brand-8': '#b4b8cd',
    'tofu-contrast': '#fff',
    'tofu-button-green': '#52e3c2',
    'tofu-button-green-hover': '#4cc0a8',
    'tofu-type-grey': '#8f94ab',
    'tofu-background-dark': '#32323e',
    'tofu-rules-dark': '#4d505f',
    'tofu-rules-light': '#d6d6d8',
    'tofu-background-light': '#f5f5f5',
    'tofu-text-heading': 'rgba(255,255,255, 1)',
    'tofu-text': 'rgba(255, 255, 255, 0.65)',
    'tofu-text-secondary': 'rgba(255, 255, 255, 0.45)',
    'disabled-color': 'rgba(255, 255, 255, 0.25)',
}
