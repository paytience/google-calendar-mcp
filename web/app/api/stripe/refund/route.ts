import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

export async function POST(request: Request) {
  const { session_id, reason } = await request.json();

  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Look up session to get stripe customer ID
  const { data: session } = await supabase
    .from("mcp_sessions")
    .select("stripe_customer_id, status")
    .eq("session_id", session_id)
    .single();

  if (!session?.stripe_customer_id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Get the customer's payment intents from Stripe
  const piRes = await fetch(
    `https://api.stripe.com/v1/payment_intents?customer=${session.stripe_customer_id}&limit=1`,
    { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } }
  );
  const piData = await piRes.json();

  if (!piData.data?.length) {
    return NextResponse.json({ error: "No payment found" }, { status: 404 });
  }

  const paymentIntent = piData.data[0];

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json({ error: "Payment not eligible for refund" }, { status: 400 });
  }

  // Check if already refunded
  if (paymentIntent.amount_received === 0 || (paymentIntent.charges?.data?.[0]?.refunded)) {
    return NextResponse.json({ error: "Already refunded" }, { status: 400 });
  }

  // Issue full refund
  const refundBody = new URLSearchParams({
    payment_intent: paymentIntent.id,
    reason: "requested_by_customer",
    ...(reason ? { "metadata[reason]": reason } : {}),
  });

  const refundRes = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: refundBody.toString(),
  });

  const refund = await refundRes.json();

  if (refund.error) {
    return NextResponse.json({ error: refund.error.message }, { status: 400 });
  }

  // Mark customer as refunded
  await supabase
    .from("mcp_customers")
    .update({ status: "refunded" })
    .eq("stripe_customer_id", session.stripe_customer_id);

  return NextResponse.json({ success: true, refund_id: refund.id });
}
