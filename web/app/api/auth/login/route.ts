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

  const { data: existing } = await supabase
    .from("mcp_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (!existing) {
    return NextResponse.redirect(new URL(`/pricing?session_id=${sessionId}`, request.url));
  }

  // Accept pending or paid sessions (pending handles race with webhook)
  if (existing.status === "completed") {
    return NextResponse.redirect(new URL(`/setup?session=${sessionId}`, request.url));
  }

  const authUrl = getAuthorizationUrl(sessionId);
  return NextResponse.redirect(authUrl);
}
