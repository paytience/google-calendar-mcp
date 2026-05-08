const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Google Calendar MCP", email: "noreply@gcalmcp.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo email failed (${res.status}): ${body}`);
  }
}

export async function sendApiKeyEmail(to: string, apiKey: string, displayName: string) {
  await sendEmail(
    to,
    "Your Google Calendar MCP API Key",
    `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Welcome, ${displayName}!</h1>
        <p style="color: #71717a; margin-bottom: 24px;">Your Google account is now connected. Here's your API key:</p>

        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">API Key</p>
          <code style="font-size: 13px; color: #4ade80; word-break: break-all;">${apiKey}</code>
        </div>

        <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Quick Setup</h2>
        <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 8px;">Run this in your terminal:</p>
        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
          <code style="font-size: 12px; color: #e4e4e7; word-break: break-all;">claude mcp add google-calendar -s user -e GOOGLE_CALENDAR_MCP_API_KEY=${apiKey} -- npx -y @paytience/google-calendar-mcp@latest</code>
        </div>

        <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 24px;">For other editors (Cursor, Windsurf, Kiro), see <a href="https://gcalmcp.com/setup" style="color: #4ade80; text-decoration: underline;">full setup instructions</a>.</p>

        <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
        <p style="font-size: 12px; color: #52525b;">Keep this key safe. If you lose it, contact support for a reset.</p>
      </div>
    `,
  );
}

export async function sendSetupLinkEmail(to: string, setupUrl: string) {
  await sendEmail(
    to,
    "Complete your Google Calendar MCP setup",
    `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Payment received!</h1>
        <p style="color: #71717a; margin-bottom: 24px;">Complete your setup by connecting your Google account:</p>

        <a href="${setupUrl}" style="display: inline-block; background: #18181b; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-bottom: 24px;">Continue Setup</a>

        <p style="color: #3f3f46; font-size: 14px; margin-top: 24px;">Or copy this link:</p>
        <p style="color: #71717a; font-size: 13px; word-break: break-all;">${setupUrl}</p>

        <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
        <p style="font-size: 12px; color: #52525b;">This link does not expire. You can return to it anytime to complete setup.</p>
      </div>
    `,
  );
}
