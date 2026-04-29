import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { exchangeCodeForTokens, fetchUserProfile } from "@/lib/microsoft-oauth";
import { encryptTokens } from "@/lib/encryption";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    const description = url.searchParams.get("error_description");
    return NextResponse.redirect(
      new URL(`/success?error=${encodeURIComponent(description || error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const sessionId = state;

  const supabase = getSupabase();

  const { data: session } = await supabase
    .from("mcp_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (!session || session.status !== "pending") {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 400 });
  }

  const tokens = await exchangeCodeForTokens(code);
  const profile = await fetchUserProfile(tokens.accessToken);

  const { encrypted, iv, tag } = await encryptTokens(JSON.stringify(tokens));

  const apiKey = `omk_${randomBytes(32).toString("base64url")}`;
  const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");

  await supabase.from("mcp_tokens").upsert({
    session_id: sessionId,
    user_email: profile.email,
    display_name: profile.displayName,
    encrypted_tokens: encrypted,
    encryption_iv: iv,
    encryption_tag: tag,
    token_expires_at: tokens.expiresAt,
  });

  await supabase.from("mcp_api_keys").insert({
    api_key_hash: apiKeyHash,
    session_id: sessionId,
    user_email: profile.email,
  });

  await supabase
    .from("mcp_sessions")
    .update({
      status: "completed",
      user_email: profile.email,
      display_name: profile.displayName,
      completed_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);

  // Store api_key temporarily in session for the status endpoint to return
  await supabase.from("mcp_sessions").update({
    display_name: `${profile.displayName}|${apiKey}`,
  }).eq("session_id", sessionId);

  return NextResponse.redirect(new URL(`/success?email=${encodeURIComponent(profile.email)}&key=${encodeURIComponent(apiKey)}`, request.url));
}
