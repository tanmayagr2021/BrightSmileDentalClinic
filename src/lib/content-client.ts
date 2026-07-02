// Client-safe companion to src/lib/content.ts — zero external imports,
// so it's safe to bundle into 'use client' components. Server Components
// fetch the content map via getContentBlocks() and pass it down as a
// prop; Client Components read out of that prop with these helpers.

export function pick(content: Record<string, string>, key: string, fallback: string): string {
  return content[key] ?? fallback
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (acc, [token, value]) => acc.replaceAll(`{${token}}`, String(value)),
    template
  )
}
