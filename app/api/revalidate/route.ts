import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = (body && body.path) || body?.pathname || '';
    if (!path) return NextResponse.json({ ok: false, error: 'path required' }, { status: 400 });
    // revalidate the provided path so fresh content is served
    await revalidatePath(path);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
