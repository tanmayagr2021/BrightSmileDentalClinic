import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildCanonical } from '@/lib/schema'
import type { BlogPostRow } from '@/types/db'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('title, excerpt, meta_title, meta_description, cover_image_url, og_image_url, published_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single()

  if (!data) return {}
  const title = data.meta_title ?? data.title
  const description = data.meta_description ?? data.excerpt ?? undefined
  const canonical = buildCanonical(`/blog/${slug}`)
  const image = data.og_image_url ?? data.cover_image_url ?? undefined
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: data.published_at ?? undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { title, description, images: image ? [image] : undefined },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (!post || post.status !== 'published') notFound()

  const { data: related } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, published_at')
    .eq('status', 'published')
    .is('deleted_at', null)
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(3)

  const typedPost = post as BlogPostRow

  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/blog" className="font-body text-sm text-gray-600 hover:text-primary transition-colors">
              Blog
            </Link>
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-gray-300" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-body text-sm text-gray-600 line-clamp-1">{typedPost.title}</span>
          </div>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display max-w-3xl">
            {typedPost.title}
          </h1>
          {typedPost.excerpt && (
            <p className="mt-5 max-w-2xl font-body text-lg text-gray-500 leading-relaxed">{typedPost.excerpt}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {typedPost.published_at && (
              <span className="font-heading text-xs font-semibold text-gray-600">
                {new Date(typedPost.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {typedPost.updated_at && typedPost.published_at &&
              new Date(typedPost.updated_at).getTime() - new Date(typedPost.published_at).getTime() > 86400000 && (
                <span className="font-body text-xs text-gray-500">
                  Last updated {new Date(typedPost.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
            )}
            {typedPost.read_time_minutes && (
              <span className="font-heading text-xs font-semibold text-gray-600">
                {typedPost.read_time_minutes} min read
              </span>
            )}
          </div>
        </div>
      </div>

      {typedPost.cover_image_url && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10">
          <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden rounded-2xl">
            <Image
              src={typedPost.cover_image_url}
              alt={typedPost.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr]">
          <article className="max-w-none">
            {typedPost.content ? (
              <div className="whitespace-pre-wrap font-body text-base text-gray-700 leading-relaxed">
                {typedPost.content}
              </div>
            ) : (
              <p className="font-body text-base text-gray-600 italic">No content available.</p>
            )}
            <div className="mt-12 border-t border-gray-100 pt-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Blog
              </Link>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-dark p-7 text-white">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-white/75 mb-3">
                Need Dental Care?
              </h3>
              <p className="font-display text-lg text-white leading-snug">
                Book a consultation today
              </p>
              <p className="mt-2 font-body text-sm text-white/50">
                Our expert team is ready to help with all your dental needs.
              </p>
              <Link
                href="/appointments"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark"
              >
                Book Appointment
              </Link>
            </div>

            {related && related.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">
                  More Articles
                </h3>
                <div className="space-y-4">
                  {(related as Pick<BlogPostRow, 'id' | 'title' | 'slug' | 'excerpt' | 'cover_image_url' | 'published_at'>[]).map((r) => (
                    <Link
                      key={r.id}
                      href={`/blog/${r.slug}`}
                      className="group block"
                    >
                      <p className="font-heading text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {r.title}
                      </p>
                      {r.published_at && (
                        <p className="mt-1 font-heading text-[0.6rem] font-medium text-gray-600">
                          {new Date(r.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
