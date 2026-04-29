import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: session } = await supabase
    .from("mcp_sessions")
    .select("status, user_email")
    .eq("session_id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: session.status,
    user_email: session.user_email || undefined,
  });
}
