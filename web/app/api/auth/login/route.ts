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

  // Session must exist (created by checkout route before Stripe redirect)
  const { data: existing } = await supabase
    .from("mcp_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (!existing) {
    // No session means they didn't go through checkout
    return NextResponse.redirect(new URL(`/pricing?session_id=${sessionId}`, request.url));
  }

  const authUrl = getAuthorizationUrl(sessionId);
  return NextResponse.redirect(authUrl);
}
