import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getAuthorizationUrl } from "@/lib/microsoft-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const paid = url.searchParams.get("paid");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Check if session already exists (returning user adding another account)
  const { data: existing } = await supabase
    .from("mcp_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (!existing) {
    // New session; verify it came from Stripe success redirect
    if (!paid) {
      return NextResponse.redirect(new URL(`/pricing?session_id=${sessionId}`, request.url));
    }

    await supabase.from("mcp_sessions").insert({
      session_id: sessionId,
      status: "pending",
    });
  }

  const authUrl = getAuthorizationUrl(sessionId);
  return NextResponse.redirect(authUrl);
}
