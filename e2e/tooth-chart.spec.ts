import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Phase B: "Choose Your Tooth" chart redesign — anatomical tooth shapes,
// region-browsing chips, and the gold-over-sage selection priority rule.
// See e2e/phase3-integration.spec.ts for the broader page-level smoke tests
// (console errors, broken images, overflow, general a11y) this suite doesn't
// duplicate.

test.describe('Tooth chart — anatomical shapes and selection', () => {
  test('chart renders all 32 teeth with kind-specific detail', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.goto('/choose-your-tooth')
    const chart = page.locator('svg[aria-label*="Interactive dental chart"]')
    await expect(chart).toBeVisible()
    await expect(chart.locator('g[role="button"]')).toHaveCount(32)
    // A molar's cusps and a canine's point are extra shape elements beyond
    // the base rect — spot-check one of each kind renders more than a bare rect.
    const wisdomMolar = chart.getByRole('button', { name: /^Upper Right 3rd Molar/ })
    await expect(wisdomMolar.locator('circle')).toHaveCount(3) // molar-3: 3 cusps
    const canine = chart.getByRole('button', { name: /^Upper Right Canine$/ })
    await expect(canine.locator('polygon')).toHaveCount(1) // canine: 1 point
  })

  test('selecting a tooth updates the detail panel and turns it gold', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.goto('/choose-your-tooth')
    const wisdomMolar = page.getByRole('button', { name: /^Upper Right 3rd Molar/ })
    await wisdomMolar.click()
    await expect(page.getByRole('heading', { name: 'Upper Right 3rd Molar (Wisdom Tooth)' })).toBeVisible()
    await expect(wisdomMolar).toHaveAttribute('aria-pressed', 'true')
    await expect(wisdomMolar.locator('rect').first()).toHaveAttribute('fill', 'rgba(201, 162, 75, 1)')
  })

  test('no two teeth overlap enough to intercept each other\'s clicks', async ({ page, browserName }) => {
    // Regression guard for the arch-spacing bug found during this phase:
    // equal-angle placement let the two outermost molars' shapes overlap by
    // more than half their own size, so a click aimed at one tooth actually
    // landed on its neighbor. Clicking every tooth in the chart and checking
    // its own aria-pressed state (rather than a neighbor's) proves the fix.
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.goto('/choose-your-tooth')
    const teeth = page.locator('svg[aria-label*="Interactive dental chart"] g[role="button"]')
    const count = await teeth.count()
    for (let i = 0; i < count; i++) {
      const tooth = teeth.nth(i)
      await tooth.click()
      await expect(tooth).toHaveAttribute('aria-pressed', 'true')
    }
  })
})

test.describe('Tooth chart — region browsing mode', () => {
  test('activating "Wisdom Tooth Area" highlights exactly the 4 wisdom teeth', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.goto('/choose-your-tooth')
    const chip = page.getByRole('button', { name: 'Wisdom Tooth Area', exact: true })
    await chip.click()
    await expect(chip).toHaveAttribute('aria-pressed', 'true')

    const wisdomTeeth = page.locator('svg[aria-label*="Interactive dental chart"] g[role="button"][aria-label*="Wisdom Tooth"]')
    await expect(wisdomTeeth).toHaveCount(4)
    for (const tooth of await wisdomTeeth.all()) {
      await expect(tooth).toHaveAttribute('aria-label', /, in Wisdom Tooth Area/)
      await expect(tooth.locator('rect').first()).toHaveAttribute('fill', 'rgba(156, 175, 136, 0.24)')
    }

    // A non-wisdom tooth stays at its default fill.
    const incisor = page.getByRole('button', { name: 'Upper Right Central Incisor' })
    await expect(incisor.locator('rect').first()).not.toHaveAttribute('fill', 'rgba(156, 175, 136, 0.24)')
  })

  test('selected tooth stays gold even inside an active region (priority rule)', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.goto('/choose-your-tooth')
    await page.getByRole('button', { name: 'Wisdom Tooth Area', exact: true }).click()
    const wisdomMolar = page.getByRole('button', { name: /^Upper Right 3rd Molar/ })
    await wisdomMolar.click()
    await expect(wisdomMolar.locator('rect').first()).toHaveAttribute('fill', 'rgba(201, 162, 75, 1)')
  })

  test('"Gums" highlights no teeth and shows the periodontist message instead', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.goto('/choose-your-tooth')
    await page.getByRole('button', { name: 'Gums' }).click()
    const highlighted = page.locator('svg[aria-label*="Interactive dental chart"] rect[fill="rgba(156, 175, 136, 0.24)"]')
    await expect(highlighted).toHaveCount(0)
    const link = page.getByRole('link', { name: 'Dr. Ameena Pradhan' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/doctors/dr-ameena-pradhan')
  })

  test('region mode and tooth selection are independent of each other', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.goto('/choose-your-tooth')
    const wisdomMolar = page.getByRole('button', { name: /^Upper Right 3rd Molar/ })
    await wisdomMolar.click()
    await expect(page.getByRole('heading', { name: 'Upper Right 3rd Molar (Wisdom Tooth)' })).toBeVisible()

    const chip = page.getByRole('button', { name: 'Wisdom Tooth Area', exact: true })
    await chip.click()
    // Activating a region doesn't clear the existing selection/detail panel.
    await expect(page.getByRole('heading', { name: 'Upper Right 3rd Molar (Wisdom Tooth)' })).toBeVisible()

    const otherTooth = page.getByRole('button', { name: 'Upper Right Canine' })
    await otherTooth.click()
    // Selecting a different tooth doesn't clear the active region chip.
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('Tooth chart — keyboard and motion', () => {
  test('region chips are keyboard operable', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.goto('/choose-your-tooth')
    const chip = page.getByRole('button', { name: 'Front Teeth', exact: true })
    await chip.focus()
    await expect(chip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Enter')
    await expect(chip).toHaveAttribute('aria-pressed', 'false')
  })

  test('reduced motion disables the hover scale transform', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/choose-your-tooth')
    const tooth = page.getByRole('button', { name: 'Upper Right Canine' })
    const before = await tooth.evaluate((el) => getComputedStyle(el).transform)
    await tooth.hover()
    await page.waitForTimeout(250)
    const after = await tooth.evaluate((el) => getComputedStyle(el).transform)
    expect(after).toBe(before)
  })

  test('no serious/critical accessibility violations with a region active', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit networking is broken in this sandbox')
    await page.goto('/choose-your-tooth')
    await page.getByRole('button', { name: 'Wisdom Tooth Area', exact: true }).click()
    await page.getByRole('button', { name: /^Upper Right 3rd Molar/ }).click()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    const summary = serious.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`).join('\n')
    expect(serious, `Serious/critical WCAG AA violations:\n${summary}`).toEqual([])
  })
})
