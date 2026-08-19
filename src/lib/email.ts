import { Resend } from 'resend'

// RESEND_FROM_EMAIL must be on a domain verified in the Resend dashboard —
// the onboarding@resend.dev sandbox address this used to hardcode can only
// deliver to the Resend account's own email, so every real patient/admin
// notification was silently failing to send.
const FROM = `${process.env.RESEND_FROM_NAME ?? 'Bright Smile Dental Clinic'} <${process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'}>`
const CLINIC_PHONE = '+977-1-4519594'
const CLINIC_WHATSAPP = '+91 8073047214'
// Both must receive every clinic/admin notification (appointment + contact).
// tanmayagr2021@gmail.com must NOT be a recipient.
const ADMIN_NOTIFICATION_EMAILS = ['brightsmiledentalclinicpvt.ltd@gmail.com', 'drsachin1108@gmail.com']

function resend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

// ─── Appointment confirmation to patient ────────────────────────────

export async function sendAppointmentConfirmation({
  to,
  patientName,
  doctorName,
  date,
  time,
  cancellationUrl,
}: {
  to: string
  patientName: string
  doctorName: string
  date: string
  time: string
  cancellationUrl?: string
}) {
  const client = resend()
  if (!client) {
    console.warn('[Email] RESEND_API_KEY not set — skipping appointment confirmation')
    return { skipped: true }
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Appointment Request Received</title></head>
<body style="font-family:Inter,sans-serif;background:#f9fafb;margin:0;padding:32px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;border:1px solid #e5e7eb;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:56px;height:56px;background:#0f1813;border-radius:14px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="color:#4A9B6F;font-size:24px;">✓</span>
      </div>
      <h1 style="margin:0;font-size:22px;color:#1a3d2b;font-weight:700;">Request Received</h1>
      <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">We'll call you within 2 hours to confirm</p>
    </div>

    <div style="background:#f0f7f2;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Patient</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${patientName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Doctor</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${doctorName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Date</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${date}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Time</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${time}</td></tr>
      </table>
    </div>

    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
      This is a <strong>request</strong>, not a confirmed booking. Our receptionist will call you to confirm the exact slot and any preparation instructions.
    </p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
        <strong>Need to reach us?</strong><br>
        📞 ${CLINIC_PHONE} &nbsp;|&nbsp; 💬 WhatsApp: ${CLINIC_WHATSAPP}
      </p>
    </div>

    ${cancellationUrl ? `<p style="text-align:center;margin:0 0 8px;"><a href="${cancellationUrl}" style="color:#6b7280;font-size:12px;">Need to cancel? Click here</a></p>` : ''}

    <p style="text-align:center;margin:0;color:#9ca3af;font-size:11px;">
      Bright Smile Dental Clinic · Nagpokhari, Naxal, Kathmandu
    </p>
  </div>
</body>
</html>`

  const { error } = await client.emails.send({
    from: FROM,
    to,
    subject: `Appointment Request — ${date} at ${time}`,
    html,
  })

  if (error) {
    console.error('[Email] Failed to send appointment confirmation:', error)
    return { error }
  }

  return { sent: true }
}

// ─── Admin notification (new appointment) ─────────────────────────

export async function sendAppointmentNotification({
  patientName,
  patientPhone,
  patientEmail,
  doctorName,
  date,
  time,
  notes,
}: {
  patientName: string
  patientPhone: string
  patientEmail: string
  doctorName: string
  date: string
  time: string
  notes?: string
}) {
  const client = resend()
  if (!client) return { skipped: true }

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f9fafb;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 20px;color:#1a3d2b;">🔔 New Appointment Request</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;color:#6b7280;">Patient</td><td style="padding:6px 0;font-weight:600;color:#111827;">${patientName}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;font-weight:600;color:#111827;">${patientPhone}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;color:#111827;">${patientEmail || 'Not provided'}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Doctor</td><td style="padding:6px 0;font-weight:600;color:#111827;">${doctorName}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;font-weight:600;color:#111827;">${date}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;font-weight:600;color:#111827;">${time}</td></tr>
      ${notes ? `<tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">Notes</td><td style="padding:6px 0;color:#374151;">${notes}</td></tr>` : ''}
    </table>
    <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;">Sent from Bright Smile booking system</p>
  </div>
</body>
</html>`

  const { error } = await client.emails.send({
    from: FROM,
    to: ADMIN_NOTIFICATION_EMAILS,
    subject: `[Booking] ${patientName} → ${doctorName} on ${date}`,
    html,
  })

  if (error) console.error('[Email] Failed to send admin notification:', error)
  return error ? { error } : { sent: true }
}

// ─── Appointment reminder to patient (day-before cron) ─────────────

export async function sendReminderEmail({
  to,
  patientName,
  date,
  time,
}: {
  to: string
  patientName: string
  date: string
  time: string
}) {
  const client = resend()
  if (!client) {
    console.warn('[Email] RESEND_API_KEY not set — skipping appointment reminder')
    return { skipped: true }
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Appointment Reminder</title></head>
<body style="font-family:Inter,sans-serif;background:#f9fafb;margin:0;padding:32px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;border:1px solid #e5e7eb;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:56px;height:56px;background:#0f1813;border-radius:14px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="color:#4A9B6F;font-size:24px;">⏰</span>
      </div>
      <h1 style="margin:0;font-size:22px;color:#1a3d2b;font-weight:700;">Appointment Reminder</h1>
      <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">See you tomorrow, ${patientName}</p>
    </div>

    <div style="background:#f0f7f2;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Date</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${date}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Time</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;text-align:right;">${time}</td></tr>
      </table>
    </div>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
        <strong>Need to reschedule or cancel?</strong><br>
        📞 ${CLINIC_PHONE} &nbsp;|&nbsp; 💬 WhatsApp: ${CLINIC_WHATSAPP}
      </p>
    </div>

    <p style="text-align:center;margin:0;color:#9ca3af;font-size:11px;">
      Bright Smile Dental Clinic · Nagpokhari, Naxal, Kathmandu
    </p>
  </div>
</body>
</html>`

  const { error } = await client.emails.send({
    from: FROM,
    to,
    subject: `Reminder: Your appointment tomorrow at ${time}`,
    html,
  })

  if (error) {
    console.error('[Email] Failed to send appointment reminder:', error)
    return { error }
  }

  return { sent: true }
}

// ─── Contact form notification ────────────────────────────────────

export async function sendContactNotification({
  name,
  email,
  phone,
  message,
}: {
  name: string
  email: string
  phone?: string
  message: string
}) {
  const client = resend()
  if (!client) return { skipped: true }

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f9fafb;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 20px;color:#1a3d2b;">📩 New Contact Form Submission</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;color:#6b7280;">Name</td><td style="padding:6px 0;font-weight:600;color:#111827;">${name}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;color:#111827;">${email}</td></tr>
      ${phone ? `<tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;color:#111827;">${phone}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">Message</td><td style="padding:6px 0;color:#374151;line-height:1.5;">${message.replace(/\n/g, '<br>')}</td></tr>
    </table>
    <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;">Sent from Bright Smile contact form</p>
  </div>
</body>
</html>`

  const { error } = await client.emails.send({
    from: FROM,
    to: ADMIN_NOTIFICATION_EMAILS,
    subject: `[Contact] ${name} — new message`,
    html,
  })

  if (error) console.error('[Email] Failed to send contact notification:', error)
  return error ? { error } : { sent: true }
}
