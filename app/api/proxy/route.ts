import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_BASE = 'https://pub-f41beccd0d7d4160947b60e1d23f53c0.r2.dev/';

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url');

  if (!target || !target.startsWith(ALLOWED_BASE)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const range = req.headers.get('range');
  const fetchHeaders: Record<string, string> = {};
  if (range) fetchHeaders['Range'] = range;

  let upstream: Response;
  try {
    upstream = await fetch(target, { headers: fetchHeaders });
  } catch {
    return new NextResponse('Upstream fetch failed', { status: 502 });
  }

  const res = new NextResponse(upstream.body, { status: upstream.status });

  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Accept-Ranges', 'bytes');
  res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  for (const h of ['Content-Type', 'Content-Length', 'Content-Range']) {
    const v = upstream.headers.get(h);
    if (v) res.headers.set(h, v);
  }

  return res;
}
