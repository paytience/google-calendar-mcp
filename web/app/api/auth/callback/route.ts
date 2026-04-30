import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { exchangeCodeForTokens, fetchUserProfile } from "@/lib/microsoft-oauth";
import { encryptTokens } from "@/lib/encryption";
import { sendApiKeyEmail } from "@/lib/email";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const sessionId = state || "";

  if (error) {
    const description = url.searchParams.get("error_description");
    return NextResponse.redirect(
      new URL(`/setup?session=${sessionId}&error=${encodeURIComponent(description || error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: session } = await supabase
    .from("mcp_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (!session || !["pending", "paid"].includes(session.status)) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 400 });
  }

  const tokens = await exchangeCodeForTokens(code);
  const profile = await fetchUserProfile(tokens.accessToken);

  const { encrypted, iv, tag } = await encryptTokens(JSON.stringify(tokens));

  await supabase.from("mcp_tokens").upsert({
    session_id: sessionId,
    user_email: profile.email,
    display_name: profile.displayName,
    encrypted_tokens: encrypted,
    encryption_iv: iv,
    encryption_tag: tag,
    token_expires_at: tokens.expiresAt,
  });

  // Reuse existing API key if one exists for this session+email
  const { data: existingKey } = await supabase
    .from("mcp_api_keys")
    .select("api_key_hash")
    .eq("session_id", sessionId)
    .eq("user_email", profile.email)
    .eq("is_active", true)
    .limit(1)
    .single();

  let apiKey: string;
  if (existingKey) {
    // Tokens refreshed, keep existing key (we can't recover the plaintext, so show a message instead)
    apiKey = "";
  } else {
    apiKey = `omk_${randomBytes(32).toString("base64url")}`;
    const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");

    await supabase.from("mcp_api_keys").insert({
      api_key_hash: apiKeyHash,
      session_id: sessionId,
      user_email: profile.email,
    });
  }

  await supabase
    .from("mcp_sessions")
    .update({
      status: "completed",
      user_email: profile.email,
      display_name: apiKey ? `${profile.displayName}|${apiKey}` : profile.displayName,
      completed_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);

  if (apiKey) {
    try {
      await sendApiKeyEmail(profile.email, apiKey, profile.displayName);
    } catch (e) {
      console.error("Failed to send API key email:", e);
    }
  }

  const redirectUrl = apiKey
    ? `/setup?session=${sessionId}&key=${encodeURIComponent(apiKey)}`
    : `/setup?session=${sessionId}&reconnected=true`;
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
