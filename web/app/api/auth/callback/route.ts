import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { exchangeCodeForTokens, fetchUserProfile } from "@/lib/google-oauth";
import { encryptTokens } from "@/lib/encryption";
import { sendApiKeyEmail } from "@/lib/email";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const sessionId = state || "";

  console.log("[callback] start", { sessionId, hasCode: !!code, hasError: !!error });

  if (error) {
    const description = url.searchParams.get("error_description");
    console.log("[callback] OAuth error", { error, description });
    return NextResponse.redirect(
      new URL(`/setup?session=${sessionId}&error=${encodeURIComponent(description || error)}`, request.url)
    );
  }

  if (!code || !state) {
    console.log("[callback] missing code or state");
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: session, error: sessionError } = await supabase
    .from("mcp_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  console.log("[callback] session lookup", { found: !!session, status: session?.status, sessionError: sessionError?.message });

  if (!session || !["pending", "paid"].includes(session.status)) {
    console.log("[callback] session rejected", { status: session?.status });
    return NextResponse.json({ error: `Invalid or expired session (status: ${session?.status || "not found"})` }, { status: 400 });
  }

  console.log("[callback] exchanging code for tokens...");
  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code);
    console.log("[callback] token exchange success", { expiresAt: tokens.expiresAt, hasRefreshToken: !!tokens.refreshToken });
  } catch (e) {
    console.error("[callback] token exchange FAILED", e);
    return NextResponse.redirect(
      new URL(`/setup?session=${sessionId}&error=${encodeURIComponent("Token exchange failed: " + (e as Error).message)}`, request.url)
    );
  }

  console.log("[callback] fetching user profile...");
  let profile;
  try {
    profile = await fetchUserProfile(tokens.accessToken);
    console.log("[callback] profile fetched", { email: profile.email, displayName: profile.displayName });
  } catch (e) {
    console.error("[callback] profile fetch FAILED", e);
    return NextResponse.redirect(
      new URL(`/setup?session=${sessionId}&error=${encodeURIComponent("Failed to fetch profile: " + (e as Error).message)}`, request.url)
    );
  }

  const { encrypted, iv, tag } = await encryptTokens(JSON.stringify(tokens));
  console.log("[callback] tokens encrypted", { encryptedLength: encrypted.length });

  // Update existing token row or insert new one
  const { data: existingToken, error: lookupError } = await supabase
    .from("mcp_tokens")
    .select("id")
    .eq("session_id", sessionId)
    .eq("user_email", profile.email)
    .limit(1)
    .single();

  console.log("[callback] token row lookup", { existingId: existingToken?.id, lookupError: lookupError?.message });

  if (existingToken) {
    const { error: updateError } = await supabase
      .from("mcp_tokens")
      .update({
        display_name: profile.displayName,
        encrypted_tokens: encrypted,
        encryption_iv: iv,
        encryption_tag: tag,
        token_expires_at: tokens.expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingToken.id);

    console.log("[callback] token UPDATE", { id: existingToken.id, error: updateError?.message || "none" });

    if (updateError) {
      return NextResponse.redirect(
        new URL(`/setup?session=${sessionId}&error=${encodeURIComponent("Failed to update tokens: " + updateError.message)}`, request.url)
      );
    }
  } else {
    const { error: insertError } = await supabase.from("mcp_tokens").insert({
      session_id: sessionId,
      user_email: profile.email,
      display_name: profile.displayName,
      encrypted_tokens: encrypted,
      encryption_iv: iv,
      encryption_tag: tag,
      token_expires_at: tokens.expiresAt,
    });

    console.log("[callback] token INSERT", { error: insertError?.message || "none" });

    if (insertError) {
      return NextResponse.redirect(
        new URL(`/setup?session=${sessionId}&error=${encodeURIComponent("Failed to insert tokens: " + insertError.message)}`, request.url)
      );
    }
  }

  // Reuse existing API key if one exists for this session+email
  const { data: existingKey } = await supabase
    .from("mcp_api_keys")
    .select("api_key_hash")
    .eq("session_id", sessionId)
    .eq("user_email", profile.email)
    .eq("is_active", true)
    .limit(1)
    .single();

  console.log("[callback] api key lookup", { hasExistingKey: !!existingKey });

  let apiKey: string;
  if (existingKey) {
    apiKey = "";
  } else {
    apiKey = `gcmk_${randomBytes(32).toString("base64url")}`;
    const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");

    await supabase.from("mcp_api_keys").insert({
      api_key_hash: apiKeyHash,
      session_id: sessionId,
      user_email: profile.email,
    });
    console.log("[callback] new API key created");
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

  console.log("[callback] session marked completed");

  if (apiKey) {
    try {
      await sendApiKeyEmail(profile.email, apiKey, profile.displayName);
      console.log("[callback] API key email sent");
    } catch (e) {
      console.error("[callback] email send failed:", e);
    }
  }

  const redirectUrl = apiKey
    ? `/setup?session=${sessionId}&key=${encodeURIComponent(apiKey)}`
    : `/setup?session=${sessionId}&reconnected=true`;
  console.log("[callback] DONE, redirecting to", redirectUrl);
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
