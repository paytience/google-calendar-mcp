import { NextResponse } from "next/server";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const PRICE_ID = process.env.STRIPE_PRICE_ID || "price_1TRXnEIvnPDvHV9e0w0KpIDI";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://mcpoutlook.com";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const sessionId = body.session_id;

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const checkoutSession = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "mode": "payment",
      "line_items[0][price]": PRICE_ID,
      "line_items[0][quantity]": "1",
      "success_url": `${BASE_URL}/api/auth/login?session_id=${sessionId}&paid=true`,
      "cancel_url": `${BASE_URL}/pricing?canceled=true`,
      "metadata[session_id]": sessionId,
    }).toString(),
  });

  if (!checkoutSession.ok) {
    const err = await checkoutSession.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const data = await checkoutSession.json();
  return NextResponse.json({ url: data.url });
}
