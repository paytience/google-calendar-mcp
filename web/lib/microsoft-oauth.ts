const SCOPES = [
  "offline_access",
  "Mail.Read",
  "Mail.Send",
  "Mail.ReadWrite",
  "Calendars.Read",
  "Calendars.ReadWrite",
  "Contacts.Read",
  "Contacts.ReadWrite",
  "MailboxSettings.ReadWrite",
  "User.Read",
];

export function getAuthorizationUrl(sessionId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI!,
    response_mode: "query",
    scope: SCOPES.join(" "),
    state: sessionId,
  });
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID!,
    client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
    code,
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI!,
    grant_type: "authorization_code",
    scope: SCOPES.join(" "),
  });

  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

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
  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to fetch user profile");
  const data = await response.json();
  return {
    email: (data.mail || data.userPrincipalName) as string,
    displayName: (data.displayName || data.mail || data.userPrincipalName) as string,
  };
}
