import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendSetupLinkEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://mcpoutlook.com";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const event = await verifyWebhookSignature(body, signature, webhookSecret);
  if (!event) {
    console.error("Webhook signature verification failed", {
      signatureHeader: signature.substring(0, 50) + "...",
      secretPrefix: webhookSecret.substring(0, 10) + "...",
      bodyLength: body.length,
    });
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
        .update({
          stripe_customer_id: customerId,
          status: "paid",
          user_email: customerEmail,
        })
        .eq("session_id", mcpSessionId);

      // Send setup link email
      if (customerEmail) {
        try {
          const setupUrl = `${BASE_URL}/setup?session=${mcpSessionId}`;
          await sendSetupLinkEmail(customerEmail, setupUrl);
        } catch (e) {
          console.error("Failed to send setup link email:", e);
        }
      }
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

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<any | null> {
  const crypto = await import("node:crypto");
  const elements: Record<string, string> = {};
  for (const part of signature.split(",")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      elements[part.slice(0, idx).trim()] = part.slice(idx + 1);
    }
  }

  const timestamp = elements["t"];
  const v1 = elements["v1"];
  if (!timestamp || !v1) return null;

  const payload = `${timestamp}.${body}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (expected !== v1) return null;

  return JSON.parse(body);
}
