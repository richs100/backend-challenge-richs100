import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt"

export async function POST(request: Request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, raw: true })

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const type = request.headers.get('content-type');
  if (!type) {
    return NextResponse.json({ error: 'Content-Type header is missing' }, { status: 400 });
  }
  const name = request.headers.get('x-filename') || 'uploaded_file';
  const dataBytes = await request.arrayBuffer();
  const backendApiUrl = process.env.BACKEND_API_URL;

  if (!backendApiUrl) {
    return NextResponse.json({ error: 'BACKEND_API_URL is not set' }, { status: 500 });
  }

  try {
    const response = await fetch(`${backendApiUrl}/upload`, {
      method: 'POST',
      headers: {
        'X-FileName': name,
        'Content-Type': type,
        'Authorization': `Bearer ${token}`,
      },
      body: dataBytes,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
