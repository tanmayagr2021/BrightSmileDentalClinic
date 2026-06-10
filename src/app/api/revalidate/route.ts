import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (!process.env.REVALIDATION_SECRET || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  let path = '/'
  try {
    const body = await req.json()
    path = body?.path ?? '/'
  } catch {
    // body is optional
  }

  revalidatePath(path)
  return NextResponse.json({ revalidated: true, path })
}
