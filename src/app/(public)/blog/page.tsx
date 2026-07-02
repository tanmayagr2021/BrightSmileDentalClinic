import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BlogPostRow } from '@/types/db'
import { buildCanonical } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/blog') },
  title: 'Blog',
  description: 'Dental health tips, news and updates from Bright Smile Dental Clinic, Kathmandu.',
}

export default async function BlogPage() {
  const supabase = createAdminClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, published_at, read_time_minutes, is_featured')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })

  const typedPosts = (posts ?? []) as Pick<BlogPostRow, 'id' | 'title' | 'slug' | 'excerpt' | 'cover_image_url' | 'published_at' | 'read_time_minutes' | 'is_featured'>[]

  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Dental Health
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">Blog</h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500">
            Tips, guides, and updates from our dental team.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {typedPosts.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-tint p-12 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-dark tracking-display">Articles Coming Soon</h2>
            <p className="mt-3 font-body text-sm text-gray-500">
              Our team is writing helpful dental health guides. Check back soon.
            </p>
            <Link href="/" className="mt-6 inline-block font-body text-sm text-primary hover:underline underline-offset-2">
              ← Back to home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {typedPosts.map((post) => (
              <article key={post.id} className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                {post.cover_image_url ? (
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-primary/30" aria-hidden="true">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {post.published_at && (
                      <span className="font-heading text-[0.6rem] font-semibold text-gray-600">
                        {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {post.read_time_minutes && (
                      <span className="font-heading text-[0.6rem] font-semibold text-gray-600">
                        · {post.read_time_minutes} min read
                      </span>
                    )}
                  </div>
                  <h2 className="font-heading text-base font-semibold text-dark group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 flex-1 font-body text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    Read More
                    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
