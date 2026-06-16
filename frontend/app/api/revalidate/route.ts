import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const path = searchParams.get('path')
  const tag = searchParams.get('tag')

  const expectedSecret = process.env.REVALIDATE_SECRET || 'fallback-revalidate-secret'

  if (secret !== expectedSecret) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  try {
    if (path) {
      revalidatePath(path)
      return NextResponse.json({ revalidated: true, path, now: Date.now() })
    }

    if (tag) {
      revalidateTag(tag, 'max')
      return NextResponse.json({ revalidated: true, tag, now: Date.now() })
    }

    return NextResponse.json({ message: 'Missing path or tag parameter' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
