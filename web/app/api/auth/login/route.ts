import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthorizationUrl } from "@/lib/microsoft-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  await supabase.from("mcp_sessions").insert({
    session_id: sessionId,
    status: "pending",
  });

  const authUrl = getAuthorizationUrl(sessionId);
  return NextResponse.redirect(authUrl);
}
