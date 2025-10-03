import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt"

export async function POST(request: Request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, raw: true })

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { question, history } = await request.json();
  const backendApiUrl = process.env.BACKEND_API_URL;

  if (!backendApiUrl) {
    return NextResponse.json({ error: 'BACKEND_API_URL is not set' }, { status: 500 });
  }

  try {
    const response = await fetch(`${backendApiUrl}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ question, history }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
