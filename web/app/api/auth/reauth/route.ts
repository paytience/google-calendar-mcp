import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { getAuthorizationUrl } from "@/lib/google-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("api_key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing api_key" }, { status: 400 });
  }

  const supabase = getSupabase();
  const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");

  const { data: keyRow } = await supabase
    .from("mcp_api_keys")
    .select("session_id, user_email, is_active")
    .eq("api_key_hash", apiKeyHash)
    .single();

  if (!keyRow || !keyRow.is_active) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Reset session to pending so the callback accepts it
  await supabase
    .from("mcp_sessions")
    .update({ status: "pending" })
    .eq("session_id", keyRow.session_id);

  const authUrl = getAuthorizationUrl(keyRow.session_id);
  return NextResponse.redirect(authUrl);
}
