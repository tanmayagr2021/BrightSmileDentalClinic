'use client'

import { useState, useEffect } from 'react'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Settings = {
  clinic_name: string; tagline: string
  phone_primary: string; phone_whatsapp: string
  email_general: string; email_appointments: string
  address_line1: string; address_line2: string
  address_city: string; address_country: string
  google_maps_url: string
  facebook_url: string; instagram_url: string
  booking_form_enabled: boolean
}

type Hour = { day_of_week: number; is_open: boolean; open_time: string; close_time: string }

const DEFAULTS: Settings = {
  clinic_name: 'Bright Smile Dental Clinic', tagline: 'Creating Smiles, Changing Lives',
  phone_primary: '', phone_whatsapp: '', email_general: '', email_appointments: '',
  address_line1: '', address_line2: '', address_city: 'Kathmandu', address_country: 'Nepal',
  google_maps_url: '', facebook_url: '', instagram_url: '', booking_form_enabled: true,
}

const DEFAULT_HOURS: Hour[] = DAY_NAMES.map((_, i) => ({
  day_of_week: i, is_open: i !== 0, open_time: '09:00', close_time: i === 6 ? '14:00' : '18:00',
}))

function Field({ label, value, onChange, placeholder, type = 'text', hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string
}) {
  return (
    <div>
      <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
      {hint && <p className="mt-1 font-body text-[0.62rem] text-gray-600">{hint}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-heading text-sm font-semibold text-gray-800 pb-3 border-b border-gray-50">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [hours, setHours] = useState<Hour[]>(DEFAULT_HOURS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetch('/api/admin/settings/website')
      .then(r => r.json())
      .then(({ settings: s, hours: h }) => {
        if (s) {
          setSettings({
            clinic_name: s.clinic_name ?? DEFAULTS.clinic_name,
            tagline: s.tagline ?? DEFAULTS.tagline,
            phone_primary: s.phone_primary ?? '',
            phone_whatsapp: s.phone_whatsapp ?? '',
            email_general: s.email_general ?? '',
            email_appointments: s.email_appointments ?? '',
            address_line1: s.address_line1 ?? '',
            address_line2: s.address_line2 ?? '',
            address_city: s.address_city ?? 'Kathmandu',
            address_country: s.address_country ?? 'Nepal',
            google_maps_url: s.google_maps_url ?? '',
            facebook_url: s.facebook_url ?? '',
            instagram_url: s.instagram_url ?? '',
            booking_form_enabled: s.booking_form_enabled ?? true,
          })
        }
        if (h && h.length > 0) {
          setHours(h.map((row: Hour) => ({
            day_of_week: row.day_of_week,
            is_open: row.is_open,
            open_time: row.open_time ?? '09:00',
            close_time: row.close_time ?? '18:00',
          })))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const set = (key: keyof Settings) => (val: string) => setSettings(s => ({ ...s, [key]: val }))

  const updateHour = (day: number, patch: Partial<Hour>) =>
    setHours(prev => prev.map(h => h.day_of_week === day ? { ...h, ...patch } : h))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/website', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          hours: hours.map(h => ({
            day_of_week: h.day_of_week,
            is_open: h.is_open,
            open_time: h.is_open ? h.open_time : null,
            close_time: h.is_open ? h.close_time : null,
          })),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      showToast('Settings saved', true)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error saving', false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100 mb-2" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Website Settings</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Clinic name, contact info, social links, and opening hours.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-5">
        <Section title="Clinic Identity">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Clinic Name" value={settings.clinic_name} onChange={set('clinic_name')} />
            <Field label="Tagline" value={settings.tagline} onChange={set('tagline')} placeholder="Creating Smiles, Changing Lives" />
          </div>
        </Section>

        <Section title="Contact Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Main Phone" value={settings.phone_primary} onChange={set('phone_primary')} type="tel" placeholder="+977-1-XXXXXXX" />
            <Field label="WhatsApp Number" value={settings.phone_whatsapp} onChange={set('phone_whatsapp')} type="tel" />
            <Field label="General Email" value={settings.email_general} onChange={set('email_general')} type="email" />
            <Field label="Appointments Email" value={settings.email_appointments} onChange={set('email_appointments')} type="email" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Address Line 1" value={settings.address_line1} onChange={set('address_line1')} placeholder="Nagpokhari, Naxal" />
            <Field label="Address Line 2" value={settings.address_line2} onChange={set('address_line2')} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="City" value={settings.address_city} onChange={set('address_city')} />
            <Field label="Country" value={settings.address_country} onChange={set('address_country')} />
          </div>
          <Field label="Google Maps URL" value={settings.google_maps_url} onChange={set('google_maps_url')} hint="Used for the embedded map on the Contact page." />
        </Section>

        <Section title="Social Media">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Facebook Page URL" value={settings.facebook_url} onChange={set('facebook_url')} />
            <Field label="Instagram Profile URL" value={settings.instagram_url} onChange={set('instagram_url')} />
          </div>
        </Section>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-heading text-sm font-semibold text-gray-800 pb-3 border-b border-gray-50">Opening Hours</h3>
          <div className="space-y-3">
            {hours.map((h) => (
              <div key={h.day_of_week} className="flex items-center gap-3">
                <span className="w-24 flex-shrink-0 font-heading text-xs font-semibold text-gray-600">{DAY_NAMES[h.day_of_week]}</span>
                <button
                  onClick={() => updateHour(h.day_of_week, { is_open: !h.is_open })}
                  className={`relative flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${h.is_open ? 'bg-primary' : 'bg-gray-200'}`}
                  role="switch" aria-checked={h.is_open}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${h.is_open ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                {h.is_open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={h.open_time} onChange={(e) => updateHour(h.day_of_week, { open_time: e.target.value })}
                      className="rounded-lg border border-gray-200 px-2 py-1 font-body text-xs text-gray-900 outline-none focus:border-primary" />
                    <span className="font-body text-xs text-gray-600">to</span>
                    <input type="time" value={h.close_time} onChange={(e) => updateHour(h.day_of_week, { close_time: e.target.value })}
                      className="rounded-lg border border-gray-200 px-2 py-1 font-body text-xs text-gray-900 outline-none focus:border-primary" />
                  </div>
                ) : (
                  <span className="flex-1 font-heading text-xs font-semibold text-red-400">Closed</span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 font-body text-[0.62rem] text-gray-600">Hours sync to the Contact page, Footer, and Appointment booking flow.</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-heading text-sm font-semibold text-gray-800 pb-3 border-b border-gray-50">Booking Form</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-xs font-semibold text-gray-700">Enable Online Booking</p>
              <p className="font-body text-[0.62rem] text-gray-600 mt-0.5">Turn off to display a &quot;call to book&quot; message instead.</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, booking_form_enabled: !s.booking_form_enabled }))}
              className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${settings.booking_form_enabled ? 'bg-primary' : 'bg-gray-200'}`}
              role="switch" aria-checked={settings.booking_form_enabled}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${settings.booking_form_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
