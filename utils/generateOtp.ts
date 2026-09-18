import { randomInt } from 'node:crypto'

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const generateOTP = () =>
    Array.from({ length: 10 }, () => alphabet[randomInt(alphabet.length)]).join('')
