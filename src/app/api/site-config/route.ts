import { NextResponse } from 'next/server'
import { getPublicSiteConfig } from '@/lib/server/public-site-config'

export const revalidate = 60

export async function GET() {
  return NextResponse.json(await getPublicSiteConfig())
}
