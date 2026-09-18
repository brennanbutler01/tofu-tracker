const nextJest = require('next/jest')
module.exports = nextJest({ dir: './' })({
    watchman: false,
    testEnvironment: 'node',
    testMatch: ['<rootDir>/scripts/visitorWorkspace.integration.ts'],
    moduleNameMapper: {
        '^@/prisma/(.*)$': '<rootDir>/prisma/lib/$1',
        '^@/server/(.*)$': '<rootDir>/server/$1',
    },
})
