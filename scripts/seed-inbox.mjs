#!/usr/bin/env node
/**
 * Seeds the connected Outlook mailbox with sample emails for testing.
 * Usage: OUTLOOK_MCP_API_KEY="omk_..." node scripts/seed-inbox.mjs
 */

const API_KEY = process.env.OUTLOOK_MCP_API_KEY;
if (!API_KEY) {
  console.error("Set OUTLOOK_MCP_API_KEY env var");
  process.exit(1);
}

const TOKEN_URL = "https://baushlqryuckehdslhik.supabase.co/functions/v1/mcp-tokens/refresh";

async function getAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.tokens.accessToken;
}

async function createMessage(accessToken, message) {
  const res = await fetch("https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create message failed: ${res.status} ${err}`);
  }
  return res.json();
}

const sampleEmails = [
  {
    subject: "Q4 Budget Review - Action Required",
    from: { emailAddress: { name: "Sarah Chen", address: "sarah.chen@contoso.com" } },
    body: { contentType: "HTML", content: "<p>Hi,</p><p>Please review the attached Q4 budget proposal. We need your sign-off by Friday.</p><p>Key changes:</p><ul><li>Marketing spend increased 15%</li><li>Engineering headcount +3</li><li>Travel budget reduced 20%</li></ul><p>Let me know if you have questions.</p><p>Best,<br>Sarah</p>" },
    receivedDateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    subject: "Re: Client Meeting Tomorrow",
    from: { emailAddress: { name: "Mike Johnson", address: "mike.j@fabrikam.com" } },
    body: { contentType: "HTML", content: "<p>Confirmed for 2pm. I'll bring the contract drafts.</p><p>Can you prepare the project timeline slide?</p><p>Thanks,<br>Mike</p>" },
    receivedDateTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    subject: "Invoice #INV-2026-0847",
    from: { emailAddress: { name: "Accounts Payable", address: "ap@woodgrove.com" } },
    body: { contentType: "HTML", content: "<p>Please find attached invoice #INV-2026-0847 for consulting services rendered in April 2026.</p><p>Amount due: $4,750.00<br>Due date: May 15, 2026</p><p>Payment terms: Net 14</p><p>Regards,<br>Woodgrove Accounts</p>" },
    receivedDateTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    subject: "Team Standup Notes - May 1",
    from: { emailAddress: { name: "Alex Rivera", address: "alex.r@contoso.com" } },
    body: { contentType: "HTML", content: "<p>Notes from today's standup:</p><p><b>Alex:</b> Finishing API integration, blocked on staging credentials<br><b>Priya:</b> UI redesign on track, demo Friday<br><b>Tom:</b> Fixed the auth timeout bug, PR out for review</p><p>Action items:</p><ul><li>Alex: follow up with DevOps on credentials</li><li>Priya: share Figma link with stakeholders</li><li>All: review Tom's PR by EOD</li></ul>" },
    receivedDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    subject: "Renewal Notice: Software License",
    from: { emailAddress: { name: "Licensing Team", address: "licensing@microsoft.com" } },
    body: { contentType: "HTML", content: "<p>Your annual license for Microsoft 365 Business Premium is due for renewal on June 1, 2026.</p><p>Current plan: 10 seats @ $22/user/month<br>Annual total: $2,640.00</p><p>To renew or make changes, visit your admin center.</p>" },
    receivedDateTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    subject: "Urgent: Server Alert - High CPU",
    from: { emailAddress: { name: "Monitoring System", address: "alerts@ops.contoso.com" } },
    body: { contentType: "HTML", content: "<p><b>ALERT: High CPU utilization detected</b></p><p>Server: prod-api-03<br>CPU: 94% (threshold: 80%)<br>Duration: 15 minutes<br>Time: 2026-05-01T14:23:00Z</p><p>Recent deployments: v2.4.1 deployed 30 min ago</p><p>Recommended action: Check recent deployment, consider rollback if issue persists.</p>" },
    receivedDateTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    subject: "Weekend Plans?",
    from: { emailAddress: { name: "Emma Wilson", address: "emma.w@outlook.com" } },
    body: { contentType: "HTML", content: "<p>Hey!</p><p>Are you free Saturday? Thinking of doing a hike up Pulpit Rock if the weather holds. Could start around 10am.</p><p>Let me know!</p><p>Emma</p>" },
    receivedDateTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    subject: "New Case Assignment: Matter #2026-312",
    from: { emailAddress: { name: "Case Management", address: "casemanager@lawfirm.com" } },
    body: { contentType: "HTML", content: "<p>A new matter has been assigned to you:</p><p><b>Matter:</b> #2026-312<br><b>Client:</b> Northwind Traders<br><b>Type:</b> Contract Review<br><b>Deadline:</b> May 10, 2026<br><b>Priority:</b> High</p><p>Documents have been uploaded to the shared drive. Please review and provide initial assessment by May 5.</p>" },
    receivedDateTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
];

async function main() {
  console.log("Fetching access token...");
  const token = await getAccessToken();
  console.log("Token acquired. Seeding inbox with %d messages...", sampleEmails.length);

  for (const email of sampleEmails) {
    try {
      const result = await createMessage(token, email);
      console.log("  Created: %s", result.subject);
    } catch (err) {
      console.error("  Failed: %s - %s", email.subject, err.message);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
