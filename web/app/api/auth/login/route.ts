import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getAuthorizationUrl } from "@/lib/microsoft-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Check if session exists and has a linked Stripe customer (payment verified via webhook)
  const { data: existing } = await supabase
    .from("mcp_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (!existing) {
    // No session: redirect to pricing to pay first
    return NextResponse.redirect(new URL(`/pricing?session_id=${sessionId}`, request.url));
  }

  // Verify payment: stripe_customer_id is set by the webhook after successful payment
  if (!existing.stripe_customer_id) {
    // Session exists but payment not confirmed yet; check mcp_customers
    const { data: customer } = await supabase
      .from("mcp_customers")
      .select("stripe_customer_id")
      .eq("stripe_session_id", sessionId)
      .single();

    if (!customer) {
      return NextResponse.redirect(new URL(`/pricing?session_id=${sessionId}`, request.url));
    }

    // Link customer to session
    await supabase
      .from("mcp_sessions")
      .update({ stripe_customer_id: customer.stripe_customer_id })
      .eq("session_id", sessionId);
  }

  const authUrl = getAuthorizationUrl(sessionId);
  return NextResponse.redirect(authUrl);
}
