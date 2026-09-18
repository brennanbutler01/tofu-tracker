import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
async function finishCourse(page: Page) {
    await page.getByRole('button', { name: 'Start course' }).click()
    await expect(
        page.getByRole('button', { name: 'Submit answer' })
    ).toBeDisabled()
    await page.getByLabel('Ask a focused follow-up question').check()
    await page.getByRole('button', { name: 'Submit answer' }).click()
    await expect(page.getByText('That’s right.', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Next question' }).click()
    await page.getByLabel('Customer called again').check()
    await page.getByRole('button', { name: 'Submit answer' }).click()
    await expect(
        page.getByText('A chance to learn.', { exact: true })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Next question' }).click()
    await page
        .getByLabel('Your handoff')
        .fill(
            'Confirmed the customer’s goal and reproduced the error. Please review the attached steps and follow up tomorrow.'
        )
    await page.getByRole('button', { name: 'Submit answer' }).click()
    await page.getByRole('button', { name: 'See your results' }).click()
    await expect(page.getByText('50%', { exact: true })).toBeVisible()
}
test('course feedback and human review update learner results', async ({
    page,
}) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await page.screenshot({
        path: 'test-results/portfolio-desktop.png',
        fullPage: true,
    })
    await finishCourse(page)
    await page.getByRole('button', { name: 'Try the reviewer view' }).click()
    await expect(
        page.getByRole('button', { name: 'Meets expectations' })
    ).toBeDisabled()
    await page
        .getByLabel('Your feedback')
        .fill('Clear evidence and a specific next step. Good handoff.')
    await page.getByRole('button', { name: 'Meets expectations' }).click()
    await expect(
        page.getByRole('heading', { name: 'All caught up' })
    ).toBeVisible()
    await page
        .getByRole('button', { name: 'View results', exact: true })
        .click()
    await expect(page.getByText('67%', { exact: true })).toBeVisible()
    await expect(
        page.getByText('Clear evidence and a specific next step. Good handoff.')
    ).toBeVisible()
    expect(errors).toEqual([])
})
test('reviewer can request improvement without changing other answers', async ({
    page,
}) => {
    await page.goto('/')
    await finishCourse(page)
    await page.getByRole('button', { name: 'Try the reviewer view' }).click()
    await page
        .getByLabel('Your feedback')
        .fill('Please include the exact error message.')
    await page
        .getByRole('button', { name: 'Needs improvement', exact: true })
        .click()
    await page
        .getByRole('button', { name: 'View results', exact: true })
        .click()
    await expect(page.getByText('33%', { exact: true })).toBeVisible()
})
test('sample state is independent and disposable', async ({
    page,
    context,
}) => {
    await page.goto('/')
    await finishCourse(page)
    const other = await context.newPage()
    try {
        await other.goto('/')
        await expect(
            other.getByRole('button', { name: 'Start course' })
        ).toBeVisible()
    } finally {
        await other.close()
    }
    await page.getByRole('button', { name: 'Reset demo' }).click()
    await expect(
        page.getByRole('button', { name: 'Start course' })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Start course' }).click()
    await page.reload()
    await expect(
        page.getByRole('button', { name: 'Start course' })
    ).toBeVisible()
})
test('mobile flow fits the viewport and never calls a backend', async ({
    page,
}) => {
    const forbidden: string[] = []
    page.on('request', request => {
        if (new URL(request.url()).pathname.startsWith('/api/'))
            forbidden.push(request.url())
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await finishCourse(page)
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth
        )
    ).toBe(true)
    expect(forbidden).toEqual([])
    await page.screenshot({
        path: 'test-results/portfolio-mobile.png',
        fullPage: true,
    })
})
test('server and credential routes are not published', async ({ request }) => {
    for (const path of [
        '/.env',
        '/.env.local',
        '/.git/config',
        '/api/auth/session',
        '/api/users',
        '/server/authOptions.ts',
    ]) {
        expect((await request.get(path)).status()).toBe(404)
    }
})
