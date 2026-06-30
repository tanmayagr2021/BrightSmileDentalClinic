'use client'

import dynamic from 'next/dynamic'

// Must be a Client Component — `ssr: false` is only permitted in client components.
const BrightAI = dynamic(() => import('./BrightAI'), {
  ssr: false,
  loading: () => null,
})

export default function BrightAILoader() {
  return <BrightAI />
}
