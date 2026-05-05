const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function getAuthorizationUrl(sessionId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    scope: SCOPES.join(" "),
    state: sessionId,
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    code,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function fetchUserProfile(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to fetch user profile");
  const data = await response.json();
  return {
    email: data.email as string,
    displayName: (data.name || data.email) as string,
  };
}
