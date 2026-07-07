'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { BlogPostRow } from '@/types/db'
import MediaPicker, { type MediaPickerUsageContext } from '@/components/admin/MediaPicker'

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-gray-100 text-gray-500 border border-gray-200' },
  published: { label: 'Published', className: 'bg-green-50 text-green-600 border border-green-200' },
  archived:  { label: 'Archived',  className: 'bg-amber-50 text-amber-600 border border-amber-200' },
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

type EditDraft = {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string
  status: string
  published_at: string
}

function emptyDraft(): EditDraft {
  return { title: '', slug: '', excerpt: '', content: '', cover_image_url: '', status: 'draft', published_at: '' }
}

export default function BlogClient({ posts }: { posts: BlogPostRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<EditDraft>(emptyDraft())
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<EditDraft>(emptyDraft())

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const handleAdd = async () => {
    if (!addForm.title.trim() || !addForm.slug.trim()) {
      showToast('Title and slug are required', false)
      return
    }
    const publishedAt =
      addForm.status === 'published' && !addForm.published_at
        ? new Date().toISOString()
        : addForm.published_at || null
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addForm.title.trim(),
          slug: addForm.slug.trim(),
          excerpt: addForm.excerpt.trim() || null,
          content: addForm.content.trim() || null,
          cover_image_url: addForm.cover_image_url.trim() || null,
          status: addForm.status,
          published_at: publishedAt,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('Post created', true)
      setShowAddForm(false)
      setAddForm(emptyDraft())
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    }
  }

  const startEdit = (post: BlogPostRow) => {
    setEditingId(post.id)
    setEditDraft({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      cover_image_url: post.cover_image_url ?? '',
      status: post.status,
      published_at: post.published_at ? post.published_at.slice(0, 16) : '',
    })
  }

  const saveEdit = async (id: string) => {
    const publishedAt =
      editDraft.status === 'published' && !editDraft.published_at
        ? new Date().toISOString()
        : editDraft.published_at || null
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editDraft.title.trim(),
          slug: editDraft.slug.trim(),
          excerpt: editDraft.excerpt.trim() || null,
          content: editDraft.content.trim() || null,
          cover_image_url: editDraft.cover_image_url.trim() || null,
          status: editDraft.status,
          published_at: publishedAt,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('Post saved', true)
      setEditingId(null)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('Post deleted', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Blog Posts</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Create and manage your blog articles.</p>
        </div>
        <button
          onClick={() => { setShowAddForm((v) => !v); setEditingId(null) }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 font-heading text-xs font-semibold text-primary transition-all hover:bg-primary/15"
        >
          <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Post
        </button>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {(
          [
            { label: 'Total',     value: posts.length },
            { label: 'Published', value: posts.filter((p) => p.status === 'published').length },
            { label: 'Drafts',    value: posts.filter((p) => p.status === 'draft').length },
          ] as { label: string; value: number }[]
        ).map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="mb-5 rounded-2xl border border-primary/15 bg-tint p-5 space-y-3">
          <p className="font-heading text-sm font-semibold text-gray-800">New Post</p>
          <PostForm form={addForm} onChange={setAddForm} />
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white hover:bg-primary-dark">
              Create Post
            </button>
            <button onClick={() => setShowAddForm(false)} className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500 hover:border-gray-300">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => {
          const statusStyle = STATUS_STYLES[post.status] ?? STATUS_STYLES.draft
          const isEditing = editingId === post.id
          const isLoading = loadingId === post.id

          return (
            <div key={post.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              {isEditing ? (
                <div className="p-5 space-y-3">
                  <p className="font-heading text-sm font-semibold text-gray-800">Editing: {post.title}</p>
                  <PostForm
                    form={editDraft}
                    onChange={setEditDraft}
                    usageContext={{ table: 'blog_posts', column: 'cover_image_url', recordId: post.id }}
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => saveEdit(post.id)}
                      disabled={isLoading}
                      className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                    >
                      {isLoading ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500 hover:border-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {post.cover_image_url && (
                      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" sizes="96px" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-heading text-sm font-semibold text-gray-800 leading-snug">{post.title}</h3>
                        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 font-heading text-[0.58rem] font-semibold ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      {post.excerpt && (
                        <p className="mt-1 font-body text-xs text-gray-600 leading-relaxed line-clamp-2">{post.excerpt}</p>
                      )}
                      <p className="mt-2 font-heading text-[0.6rem] font-medium text-gray-600">
                        {post.published_at
                          ? `Published ${new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : `Created ${new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-4">
                    <button
                      onClick={() => { startEdit(post); setShowAddForm(false) }}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-500 transition-all hover:border-primary/30 hover:text-primary"
                    >
                      Edit
                    </button>
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-500 transition-all hover:border-gray-300"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={isLoading}
                      className="ml-auto rounded-lg border border-red-100 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-red-400 transition-all hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {posts.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 px-5 py-12 text-center">
          <p className="font-heading text-sm font-semibold text-gray-600">No posts yet</p>
          <p className="mt-1 font-body text-xs text-gray-300">Click &ldquo;New Post&rdquo; to create your first article.</p>
        </div>
      )}
    </div>
  )
}

function PostForm({
  form,
  onChange,
  usageContext,
}: {
  form: EditDraft
  onChange: (f: EditDraft) => void
  usageContext?: MediaPickerUsageContext
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const inp = (key: keyof EditDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onChange({ ...form, [key]: e.target.value })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Title *</label>
          <input
            value={form.title}
            onChange={(e) => {
              const title = e.target.value
              onChange({
                ...form,
                title,
                slug: form.slug || slugify(title),
              })
            }}
            placeholder="e.g. 5 Tips for Healthy Teeth"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div>
          <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Slug *</label>
          <input
            value={form.slug}
            onChange={inp('slug')}
            placeholder="e.g. 5-tips-for-healthy-teeth"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>
      <div>
        <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Excerpt</label>
        <textarea
          value={form.excerpt}
          onChange={inp('excerpt')}
          rows={2}
          placeholder="Short summary shown in blog listing…"
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>
      <div>
        <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Content</label>
        <textarea
          value={form.content}
          onChange={inp('content')}
          rows={8}
          placeholder="Full article content…"
          className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>
      <div>
        <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Cover Image URL</label>
        <div className="flex gap-2">
          <input
            value={form.cover_image_url}
            onChange={inp('cover_image_url')}
            placeholder="https://…"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 font-heading text-xs font-semibold text-gray-500 transition-all hover:border-primary/30 hover:text-primary"
          >
            Choose
          </button>
        </div>
        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(selection) => onChange({ ...form, cover_image_url: selection.url })}
          bucket="blog-images"
          usageContext={usageContext}
          aspect={16 / 9}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Status</label>
          <select
            value={form.status}
            onChange={inp('status')}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Published At</label>
          <input
            type="datetime-local"
            value={form.published_at}
            onChange={inp('published_at')}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>
    </div>
  )
}
