import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ENCRYPTION_KEY = Deno.env.get("GCAL_ENCRYPTION_KEY")!;
const OAUTH_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const OAUTH_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function decryptTokens(encrypted: string, ivBase64: string, tagBase64: string): Promise<string> {
  const keyBytes = hexToBytes(ENCRYPTION_KEY);
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const tag = Uint8Array.from(atob(tagBase64), (c) => c.charCodeAt(0));
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, combined);
  return new TextDecoder().decode(decrypted);
}

async function encryptTokens(plaintext: string): Promise<{ encrypted: string; iv: string; tag: string }> {
  const keyBytes = hexToBytes(ENCRYPTION_KEY);
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertextWithTag = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const arr = new Uint8Array(ciphertextWithTag);
  const ciphertext = arr.slice(0, arr.length - 16);
  const tag = arr.slice(arr.length - 16);
  return {
    encrypted: btoa(String.fromCharCode(...ciphertext)),
    iv: btoa(String.fromCharCode(...iv)),
    tag: btoa(String.fromCharCode(...tag)),
  };
}

Deno.serve(async (req: Request) => {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing x-api-key header" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const apiKeyHash = await hashApiKey(apiKey);

  const { data: keyRow, error: keyError } = await supabase
    .from("mcp_api_keys")
    .select("session_id, user_email, is_active")
    .eq("api_key_hash", apiKeyHash)
    .single();

  if (keyError || !keyRow || !keyRow.is_active) {
    return new Response(JSON.stringify({ error: "Invalid or inactive API key" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  // Check customer payment status via session
  const { data: session } = await supabase
    .from("mcp_sessions")
    .select("stripe_customer_id")
    .eq("session_id", keyRow.session_id)
    .single();

  if (session?.stripe_customer_id) {
    const { data: customer } = await supabase
      .from("mcp_customers")
      .select("status")
      .eq("stripe_customer_id", session.stripe_customer_id)
      .single();

    if (customer && customer.status !== "active") {
      return new Response(JSON.stringify({ error: "Subscription inactive" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }
  }

  await supabase.from("mcp_api_keys").update({ last_used_at: new Date().toISOString() }).eq("api_key_hash", apiKeyHash);

  const url = new URL(req.url);
  const isRefresh = url.pathname.endsWith("/refresh");

  if (req.method === "POST" && isRefresh) {
    const { data: tokenRows, error: tokenError } = await supabase
      .from("mcp_tokens")
      .select("*")
      .eq("session_id", keyRow.session_id)
      .eq("user_email", keyRow.user_email)
      .order("token_expires_at", { ascending: false })
      .limit(1);

    const tokenRow = tokenRows?.[0];
    if (tokenError || !tokenRow) {
      return new Response(JSON.stringify({ error: "No tokens found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    let currentTokens;
    try {
      const decrypted = await decryptTokens(tokenRow.encrypted_tokens, tokenRow.encryption_iv, tokenRow.encryption_tag);
      currentTokens = JSON.parse(decrypted);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Failed to decrypt tokens" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const tokenUrl = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
      refresh_token: currentTokens.refreshToken,
      grant_type: "refresh_token",
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      return new Response(JSON.stringify({ error: `Token refresh failed: ${errBody}` }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    const tokenData = await tokenResponse.json();
    const newTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || currentTokens.refreshToken,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };

    const { encrypted, iv, tag } = await encryptTokens(JSON.stringify(newTokens));
    const { error: updateError } = await supabase
      .from("mcp_tokens")
      .update({
        encrypted_tokens: encrypted,
        encryption_iv: iv,
        encryption_tag: tag,
        token_expires_at: newTokens.expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", keyRow.session_id)
      .eq("user_email", keyRow.user_email);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to store refreshed tokens" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ tokens: newTokens }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (req.method === "GET") {
    const { data: tokenRows, error: tokenError } = await supabase
      .from("mcp_tokens")
      .select("*")
      .eq("session_id", keyRow.session_id)
      .eq("user_email", keyRow.user_email)
      .order("token_expires_at", { ascending: false })
      .limit(1);

    const tokenRow = tokenRows?.[0];
    if (tokenError || !tokenRow) {
      return new Response(JSON.stringify({ error: "No tokens found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    try {
      const decrypted = await decryptTokens(tokenRow.encrypted_tokens, tokenRow.encryption_iv, tokenRow.encryption_tag);
      const tokens = JSON.parse(decrypted);
      return new Response(JSON.stringify({ email: tokenRow.user_email, displayName: tokenRow.display_name, tokens }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Failed to decrypt tokens" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }

  if (req.method === "PUT") {
    const body = await req.json();
    const { tokens } = body;
    if (!tokens) {
      return new Response(JSON.stringify({ error: "Missing tokens in body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { encrypted, iv, tag } = await encryptTokens(JSON.stringify(tokens));

    const { error: updateError } = await supabase
      .from("mcp_tokens")
      .update({
        encrypted_tokens: encrypted,
        encryption_iv: iv,
        encryption_tag: tag,
        token_expires_at: tokens.expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", keyRow.session_id)
      .eq("user_email", keyRow.user_email);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update tokens" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
});
