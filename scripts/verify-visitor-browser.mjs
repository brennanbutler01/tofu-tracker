import { chromium, expect } from '@playwright/test'
const origin = process.env.LOCAL_API_URL || 'http://127.0.0.1:5220'
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin) && origin !== 'https://tofu-tracker-demo.vercel.app')
    throw new Error('Use the local server or the dedicated public demo')
const browser = await chromium.launch({
    headless: true,
    ...(process.platform === 'darwin' ? { channel: 'chrome' } : {}),
})
try {
    for (const mobile of [false, true]) {
        const context = await browser.newContext({
            viewport: mobile
                ? { width: 390, height: 844 }
                : { width: 1280, height: 900 },
        })
        try {
            const page = await context.newPage(),
                errors = []
            page.setDefaultTimeout(15000)
            page.on('pageerror', error => errors.push(error.message))
            await page.goto(origin + '/demo')
            await page
                .getByRole('button', { name: 'Start demo', exact: true })
                .click()
            await expect(page).toHaveURL(origin + '/play')
            await expect(
                page.getByText('Personal demo workspace', { exact: true })
            ).toBeVisible()
            const activities = await (
                await context.request.get(origin + '/api/activities')
            ).json()
            const startedActivity = await context.request.post(
                origin + '/api/activitySession',
                {
                    headers: { Origin: origin },
                    data: { activityId: activities[0].id },
                }
            )
            expect(startedActivity.status()).toBe(201)
            const activity = await startedActivity.json()
            await page.goto(origin + '/play/activity/' + activity.id)
            await page.getByRole('radio', { name: 'true', exact: true }).check()
            const answerEndpoint = '**/api/activitySession/' + activity.id
            await page.route(answerEndpoint, route =>
                route.request().method() === 'PUT'
                    ? route.fulfill({
                          status: 503,
                          contentType: 'application/json',
                          body: '{"error":"Unavailable"}',
                      })
                    : route.continue()
            )
            await page
                .getByRole('button', { name: 'Confirm', exact: true })
                .click()
            await expect(
                page.getByText(
                    'Could not save your answer. Please try again.',
                    { exact: true }
                )
            ).toBeVisible()
            await page.unroute(answerEndpoint)
            await page
                .getByRole('button', { name: 'Confirm', exact: true })
                .click()
            await page
                .getByRole('button', { name: 'Show feedback', exact: true })
                .click()
            await page
                .getByRole('button', { name: 'Create Comment', exact: true })
                .first()
                .click()
            await page
                .getByPlaceholder('Comment here...')
                .fill('Useful sample exercise')
            await page
                .getByRole('button', { name: 'Add comment', exact: true })
                .click()
            await expect(
                page.getByText('Useful sample exercise', { exact: true })
            ).toBeVisible()
            await page.getByRole('button', { name: /See Results$/ }).click()
            await expect(
                page.getByText('Activity Completed', { exact: true })
            ).toBeVisible()
            await page.reload()
            await expect(
                page.getByText('Activity Completed', { exact: true })
            ).toBeVisible()
            const queue = await (
                await context.request.get(origin + '/api/toGrade')
            ).json()
            const claimed = await context.request.post(
                origin + '/api/toGrade/session',
                {
                    headers: { Origin: origin },
                    data: { answerIds: [queue[0].id] },
                }
            )
            expect(claimed.status()).toBe(201)
            const review = await claimed.json()
            await page.goto(origin + '/admin/grade/' + review.id)
            await page
                .getByRole('radio', { name: 'Correct', exact: true })
                .check()
            await page.getByRole('button', { name: /Grade$/ }).click()
            await expect(
                page.getByRole('button', { name: /Edit Grade$/ })
            ).toBeVisible()
            await page.getByRole('button', { name: /Advance$/ }).click()
            await page
                .getByPlaceholder('Critique')
                .fill(
                    'This answer identifies investigation and mitigation steps.'
                )
            await page.getByRole('button', { name: /Add Critique$/ }).click()
            await expect(
                page.getByRole('button', { name: /Edit Critique$/ })
            ).toBeVisible()
            await page.getByRole('button', { name: /Advance$/ }).click()
            await page.getByRole('button', { name: /Advance$/ }).click()
            await page.getByRole('button', { name: 'Yes', exact: true }).click()
            await expect(
                page.getByText('Grading Session finished.', { exact: true })
            ).toBeVisible()
            await page.reload()
            await expect(
                page.getByText('Grading Session finished.', { exact: true })
            ).toBeVisible()
            await page.goto(origin + '/decks')
            await page
                .getByRole('tab', { name: 'Create Deck', exact: true })
                .click()
            const title = 'Visitor authored deck ' + mobile
            await page.getByPlaceholder('Deck Title').fill(title)
            const saving = page.waitForResponse(
                response =>
                    response.url() === origin + '/api/decks' &&
                    response.request().method() === 'POST'
            )
            await page.getByRole('button', { name: /^Create$/ }).click()
            const saved = await saving
            expect(saved.status()).toBe(201)
            const deck = await saved.json()
            await page.goto(origin + '/decks/' + deck.id)
            await expect(
                page.getByText(title, { exact: true }).first()
            ).toBeVisible()
            await page.reload()
            await expect(
                page.getByText(title, { exact: true }).first()
            ).toBeVisible()
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= innerWidth
                )
            ).toBe(true)
            await page
                .getByRole('button', { name: 'Reset demo', exact: true })
                .click()
            await expect(page).toHaveURL(origin + '/demo')
            expect(
                (await context.request.get(origin + '/api/decks')).status()
            ).toBe(401)
            await page
                .getByRole('button', { name: 'Start demo', exact: true })
                .click()
            await expect(page).toHaveURL(origin + '/play')
            const decks = await (
                await context.request.get(origin + '/api/decks')
            ).json()
            expect(decks).toHaveLength(1)
            expect(decks.some(item => item.id === deck.id)).toBe(false)
            expect(errors).toEqual([])
            console.log(
                'Passed visitor entry, learning, feedback, review, authoring and reset:',
                mobile ? 'mobile' : 'desktop'
            )
        } finally {
            await context.request.delete(origin + '/api/demo/session', {
                headers: { Origin: origin },
            })
            await context.close()
        }
    }
} finally {
    await browser.close()
}
