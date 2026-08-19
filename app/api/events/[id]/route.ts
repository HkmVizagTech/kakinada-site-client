import { NextResponse } from 'next/server';

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || 'http://localhost:3003';

export async function GET(req: Request, context: any) {
  const params = context?.params || {};
  const { id } = params as { id?: string };
  try {
    const res = await fetch(`${API}/events/${id}`, { headers: { cookie: req.headers.get('cookie') || '', authorization: req.headers.get('authorization') || '' }, credentials: 'include' });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    return NextResponse.json({ message: 'proxy error' }, { status: 500 });
  }
}
