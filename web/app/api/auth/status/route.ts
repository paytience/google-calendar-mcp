import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const { data: session } = await getSupabase()
    .from("gcal_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ ready: false, error: "Session expired" }, { status: 410 });
  }

  if (session.status === "completed") {
    const [displayName, apiKey] = (session.display_name || "").split("|");
    return NextResponse.json({
      ready: true,
      user_email: session.user_email,
      display_name: displayName,
      api_key: apiKey || undefined,
    });
  }

  return NextResponse.json({ ready: false });
}
