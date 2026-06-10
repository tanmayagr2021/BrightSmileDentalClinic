'use client'

import { useState } from 'react'
import { CLINIC_CONTACT, CLINIC_NAME, CLINIC_TAGLINE, OPENING_HOURS } from '@/lib/constants'

type FieldProps = {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  hint?: string
}

function Field({ label, value, onChange, placeholder, type = 'text', hint }: FieldProps) {
  return (
    <div>
      <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
      {hint && <p className="mt-1 font-body text-[0.62rem] text-gray-400">{hint}</p>}
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
  const [clinicName, setClinicName] = useState<string>(CLINIC_NAME)
  const [tagline, setTagline] = useState<string>(CLINIC_TAGLINE)
  const [phone, setPhone] = useState<string>(CLINIC_CONTACT.phone)
  const [whatsapp, setWhatsapp] = useState<string>(CLINIC_CONTACT.phoneWhatsApp)
  const [email, setEmail] = useState<string>(CLINIC_CONTACT.email)
  const [emailAppt, setEmailAppt] = useState<string>(CLINIC_CONTACT.emailAppointments)
  const [address, setAddress] = useState<string>(CLINIC_CONTACT.addressFull)
  const [facebook, setFacebook] = useState<string>(CLINIC_CONTACT.facebook)
  const [instagram, setInstagram] = useState<string>(CLINIC_CONTACT.instagram)
  const [mapsUrl, setMapsUrl] = useState<string>(CLINIC_CONTACT.googleMapsUrl)

  type EditableHour = { days: string; hours: string; open: boolean }
  const [hours, setHours] = useState<EditableHour[]>(OPENING_HOURS.map((h) => ({ ...h })))
  const [saved, setSaved] = useState(false)

  const updateHours = (i: number, val: string) =>
    setHours((prev) => prev.map((h, idx) => idx === i ? { ...h, hours: val } : h))

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Website Settings</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Clinic name, contact info, social links, and opening hours.</p>
        </div>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}
          className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Save Changes
        </button>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="font-heading text-xs font-semibold text-green-700">Saved locally · Will update public site after Supabase integration</p>
        </div>
      )}

      <div className="space-y-5">
        {/* Clinic identity */}
        <Section title="Clinic Identity">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Clinic Name" value={clinicName} onChange={setClinicName} />
            <Field label="Tagline" value={tagline} onChange={setTagline} placeholder="Creating Smiles, Changing Lives" />
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Main Phone" value={phone} onChange={setPhone} type="tel" placeholder="+977-1-XXXXXXX" />
            <Field label="WhatsApp Number" value={whatsapp} onChange={setWhatsapp} type="tel" placeholder="+977-98XXXXXXXX" />
            <Field label="General Email" value={email} onChange={setEmail} type="email" />
            <Field label="Appointments Email" value={emailAppt} onChange={setEmailAppt} type="email" />
          </div>
          <Field
            label="Full Address"
            value={address}
            onChange={setAddress}
            placeholder="Nagpokhari, Naxal, Kathmandu, Nepal"
          />
          <Field
            label="Google Maps URL"
            value={mapsUrl}
            onChange={setMapsUrl}
            placeholder="https://maps.google.com/..."
            hint="Used for the embedded map on the Contact page."
          />
        </Section>

        {/* Social */}
        <Section title="Social Media">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Facebook Page URL" value={facebook} onChange={setFacebook} placeholder="https://www.facebook.com/..." />
            <Field label="Instagram Profile URL" value={instagram} onChange={setInstagram} placeholder="https://www.instagram.com/..." />
          </div>
        </Section>

        {/* Opening hours */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-heading text-sm font-semibold text-gray-800 pb-3 border-b border-gray-50">Opening Hours</h3>
          <div className="space-y-3">
            {hours.map((h, i) => (
              <div key={h.days} className="flex items-center gap-3">
                <span className="w-32 flex-shrink-0 font-heading text-xs font-semibold text-gray-600">{h.days}</span>
                {!h.open ? (
                  <span className="flex-1 font-heading text-xs font-semibold text-red-400">Closed</span>
                ) : (
                  <input
                    type="text"
                    value={h.hours}
                    onChange={(e) => updateHours(i, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 font-body text-xs text-gray-900 outline-none focus:border-primary"
                    placeholder="9:00 AM – 6:00 PM"
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 font-body text-[0.62rem] text-gray-400">
            Hours sync to the Contact page, Footer, and Appointment booking flow.
          </p>
        </div>
      </div>
    </div>
  )
}
