import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getAuthorizationUrl } from "@/lib/google-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("mcp_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (!existing) {
    return NextResponse.redirect(new URL(`/pricing?session_id=${sessionId}`, request.url));
  }

  // Accept pending, paid, or completed sessions (completed = re-auth)
  if (existing.status === "expired") {
    return NextResponse.redirect(new URL(`/pricing?session_id=${sessionId}`, request.url));
  }

  // For completed sessions doing re-auth, reset to pending so callback accepts it
  if (existing.status === "completed") {
    await supabase
      .from("mcp_sessions")
      .update({ status: "pending" })
      .eq("session_id", sessionId);
  }

  const authUrl = getAuthorizationUrl(sessionId);
  return NextResponse.redirect(authUrl);
}
