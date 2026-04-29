import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendApiKeyEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { session_id, api_key } = body;

  if (!session_id || !api_key) {
    return NextResponse.json({ error: "Missing session_id or api_key" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: session } = await supabase
    .from("mcp_sessions")
    .select("status, user_email, display_name")
    .eq("session_id", session_id)
    .single();

  if (!session || session.status !== "completed") {
    return NextResponse.json({ error: "Session not completed" }, { status: 400 });
  }

  if (!session.user_email) {
    return NextResponse.json({ error: "No email on session" }, { status: 400 });
  }

  const displayName = session.display_name?.split("|")[0] || "there";

  try {
    await sendApiKeyEmail(session.user_email, api_key, displayName);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to send key email:", e);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
