import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import FaqPageClient from './FaqPageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about dental treatments, appointments, costs and more at Bright Smile Dental Clinic.',
}

export default async function FaqPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  return <FaqPageClient initialFaqs={data ?? []} />
}
