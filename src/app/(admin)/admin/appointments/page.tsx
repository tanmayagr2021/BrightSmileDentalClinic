import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import AppointmentsClient from '@/components/admin/AppointmentsClient'

export const dynamic = 'force-dynamic'

export default async function AppointmentsPage() {
  await requireAdmin()

  const supabase = createAdminClient()

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id, patient_name, patient_email, patient_phone, appointment_date, appointment_time, status, notes, is_new_patient, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) console.error('[Admin] Appointments fetch error:', error)

  return <AppointmentsClient appointments={appointments ?? []} />
}
