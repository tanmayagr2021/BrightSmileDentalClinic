import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Capped rather than left at Playwright's CPU-count default: 4+ workers
  // hammering one local Next.js server concurrently in this sandbox produces
  // intermittent, non-deterministic React hydration errors (different page
  // fails each run) purely from server-side resource contention — confirmed
  // by running the exact same suite with --workers=1, which passes 100% of
  // the time. Not a real app bug; a real browser only ever issues one
  // navigation at a time. 2 workers keeps some parallelism without
  // reintroducing the flake.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    // Dedicated port — never 3000 (the developer's own preview server) or
    // 3001 (this worktree's manual dev server); Playwright owns this one
    // end-to-end and tears it down after the run.
    command: 'npm run build && npm run start -- -p 3002',
    url: 'http://localhost:3002',
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
