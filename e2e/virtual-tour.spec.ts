import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { TOUR_SCENES, TOUR_START } from '../src/data/virtual-tour'

// Virtual Tour: the scene graph in src/data/virtual-tour.ts must stay
// internally consistent (every link lands on a real scene, every file exists
// at the size the data claims), and a visitor must be able to walk every link
// in the browser.

test.describe('Virtual tour data', () => {
  test('every scene, file, hotspot and starting view is valid', async () => {
    const ids = new Set(TOUR_SCENES.map((s) => s.id))
    expect(ids.size).toBe(TOUR_SCENES.length)
    expect(ids.has(TOUR_START)).toBe(true)

    for (const scene of TOUR_SCENES) {
      for (const file of [scene.src, scene.thumb]) {
        expect(existsSync(path.join('public', file)), `${scene.id}: ${file} missing`).toBe(true)
      }
      const meta = await sharp(path.join('public', scene.src)).metadata()
      expect([meta.width, meta.height], `${scene.id}: dimensions`).toEqual([scene.width, scene.height])

      const inBounds = ([x, y]: [number, number]) => x >= 0 && x <= scene.width && y >= 0 && y <= scene.height
      expect(inBounds(scene.initialView), `${scene.id}: initialView`).toBe(true)
      expect(scene.hotspots.length, `${scene.id}: dead end`).toBeGreaterThan(0)
      for (const h of scene.hotspots) {
        expect(ids.has(h.target), `${scene.id} -> ${h.target}`).toBe(true)
        expect(h.target).not.toBe(scene.id)
        expect(inBounds(h.at), `${scene.id} -> ${h.target}: position`).toBe(true)
      }
    }
  })
})

test.describe('Virtual tour — walking the clinic', () => {
  test('every hotspot leads to its scene, Back and Escape work', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Headless WebKit has no WebGL in this sandbox')
    // ~26 scene transitions (each a short crossfade) — well past the 30s default.
    test.setTimeout(120_000)
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

    await page.goto('/virtual-tour')
    await page.getByRole('button', { name: /Start the virtual tour/ }).click()
    const dialog = page.getByRole('dialog')
    const location = dialog.locator('[aria-live="polite"] p').nth(1)
    const start = TOUR_SCENES.find((s) => s.id === TOUR_START)!
    await expect(location).toHaveText(start.name)

    // Breadth-first over the graph: from every reachable scene, follow every link.
    const byId = new Map(TOUR_SCENES.map((s) => [s.id, s]))
    for (const scene of TOUR_SCENES) {
      await dialog.getByRole('button', { name: 'All areas of the clinic' }).click()
      await dialog.locator('#tour-overview').getByRole('button', { name: scene.name, exact: true }).click()
      await expect(location).toHaveText(scene.name)
      for (const h of scene.hotspots) {
        const target = byId.get(h.target)!
        await dialog.getByRole('button', { name: `Go to ${target.name}`, exact: true }).click()
        await expect(location).toHaveText(target.name)
        await dialog.getByRole('button', { name: `Back to ${scene.name}` }).click()
        await expect(location).toHaveText(scene.name)
      }
    }

    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    expect(errors).toEqual([])
  })
})
