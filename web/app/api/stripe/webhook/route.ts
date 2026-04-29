import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verify webhook signature
  const event = await verifyWebhookSignature(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabase();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerId = session.customer;
    const customerEmail = session.customer_details?.email;
    const mcpSessionId = session.metadata?.session_id;

    await supabase.from("mcp_customers").upsert({
      stripe_customer_id: customerId,
      stripe_session_id: session.id,
      email: customerEmail,
      status: "active",
    }, { onConflict: "stripe_customer_id" });

    if (mcpSessionId) {
      await supabase
        .from("mcp_sessions")
        .update({ stripe_customer_id: customerId })
        .eq("session_id", mcpSessionId);
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    const customerId = charge.customer;
    if (customerId) {
      await supabase
        .from("mcp_customers")
        .update({ status: "refunded" })
        .eq("stripe_customer_id", customerId);
    }
  }

  return NextResponse.json({ received: true });
}

async function verifyWebhookSignature(body: string, signature: string): Promise<any | null> {
  // Simple Stripe webhook verification
  const crypto = await import("node:crypto");
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
  const v1 = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !v1) return null;

  const payload = `${timestamp}.${body}`;
  const expected = crypto.createHmac("sha256", STRIPE_WEBHOOK_SECRET).update(payload).digest("hex");

  if (expected !== v1) return null;

  return JSON.parse(body);
}
