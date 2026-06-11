import { createAdminClient } from '@/lib/supabase/admin'
import ShowcaseClient from '@/components/admin/ShowcaseClient'

export default async function ShowcaseAdminPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('showcase_slides')
    .select('*')
    .order('sort_order', { ascending: true })

  return <ShowcaseClient slides={data ?? []} />
}
