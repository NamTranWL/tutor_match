import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email)
    return NextResponse.json({ message: "Missing email" }, { status: 400 });

  const backend =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
  const upstream = await fetch(`${backend}/api/v1/auth/resend-activation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  }).catch(() => null);

  if (!upstream)
    return NextResponse.json(
      { message: "Upstream unreachable" },
      { status: 502 }
    );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
