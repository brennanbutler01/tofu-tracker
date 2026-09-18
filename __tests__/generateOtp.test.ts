/** @jest-environment node */
import { generateOTP } from '../utils/generateOtp'

test('sign-in codes remain URL-safe and have ten characters', () => {
    for (let i = 0; i < 100; i++) expect(generateOTP()).toMatch(/^[a-zA-Z0-9]{10}$/)
})
