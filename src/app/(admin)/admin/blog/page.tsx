import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import BlogClient from '@/components/admin/BlogClient'
import type { BlogPostRow } from '@/types/db'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="font-heading text-sm font-semibold text-red-600">Failed to load posts</p>
          <p className="mt-1 font-body text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return <BlogClient posts={(data ?? []) as BlogPostRow[]} />
}
