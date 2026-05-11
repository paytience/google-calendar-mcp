# Ads Setup: gcalmcp.com & mcpoutlook.com

## Phase 1: Tracking Setup (code changes, can be automated)

### 1.1 Google Ads (gtag.js)

- [x] Add gtag.js snippet to `web/app/layout.tsx` on both repos
  - Script: `https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX`
  - Env var: `NEXT_PUBLIC_GOOGLE_ADS_ID`
- [x] Fire conversion event on /success page after purchase confirmation
  - `gtag('event', 'conversion', { send_to: 'AW-XXXXXXX/YYYYYY', value: 5.00, currency: 'USD' })`
  - Env var: `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`
- [x] Add gtag to /pricing page for "begin_checkout" event (tracks funnel drop-off)

### 1.2 Meta Pixel

- [x] Add Meta Pixel base code to `web/app/layout.tsx` on both repos
  - Env var: `NEXT_PUBLIC_META_PIXEL_ID`
- [x] Fire `Purchase` event on /success page (`fbq('track', 'Purchase', { value: 5.00, currency: 'USD' })`)
- [x] Fire `InitiateCheckout` event on /pricing page CTA click
- [x] Fire `Lead` event on /setup page when OAuth flow starts
- [ ] Verify events in Meta Events Manager (use Meta Pixel Helper Chrome extension)

### 1.3 Shared analytics component

- [x] Create `web/app/components/tracking-scripts.tsx` with both pixels
- [x] Create `web/lib/track.ts` helper for firing events consistently
- [x] Apply to both repos identically

---

## Phase 2: Account Setup (manual, ~15 min)

### 2.1 Google Ads

- [ ] Create account at ads.google.com (use existing Google login)
- [ ] Set billing (credit card)
- [ ] Create conversion action: "Purchase" (category: Purchase, value: $5, count: one per click)
- [ ] Note the Conversion ID (AW-XXXXXXXXXX) and Conversion Label
- [ ] Enable Enhanced Conversions (uses email from purchase for better attribution)

### 2.2 Meta Ads

- [ ] Create Business account at business.facebook.com
- [ ] Create Ad Account under the business
- [ ] Create Meta Pixel in Events Manager
- [ ] Note the Pixel ID (15-16 digits)
- [ ] Verify domain ownership (add DNS TXT record or meta tag)
- [ ] Set billing (credit card)

---

## Phase 3: Campaign Creation (manual, but copy/keywords prepared below)

### 3.1 Google Ads: Search Campaigns

**Campaign structure (one per product):**

#### Campaign: gcalmcp.com

| Ad Group | Keywords (phrase match) | Intent |
|----------|----------------------|--------|
| Brand/Product | "google calendar mcp", "gcal mcp", "mcp google calendar" | Direct |
| AI Calendar | "ai calendar assistant", "ai calendar integration", "calendar ai tool" | Solution |
| Claude/Cursor | "claude calendar", "cursor calendar plugin", "windsurf calendar" | Platform |
| Competitor | "reclaim ai alternative", "clockwise alternative", "motion alternative" | Capture |

#### Campaign: mcpoutlook.com

| Ad Group | Keywords (phrase match) | Intent |
|----------|----------------------|--------|
| Brand/Product | "outlook mcp", "mcp outlook", "outlook mcp server" | Direct |
| AI Email | "ai email assistant", "ai outlook integration", "email ai tool" | Solution |
| Claude/Cursor | "claude outlook", "claude email", "cursor email plugin" | Platform |
| Competitor | "superhuman alternative", "shortwave alternative" | Capture |

**Settings:**
- Bidding: Maximize conversions (switch to Target CPA after 30 conversions)
- Daily budget: $10-20 per campaign to start
- Locations: US, UK, EU, AU, CA (English-speaking dev markets)
- Networks: Search only (disable Display/Search Partners initially)
- Ad schedule: All day (devs work odd hours)

#### Ad Copy (gcalmcp.com)

**Responsive Search Ad:**
- Headlines (max 30 chars each):
  1. "Google Calendar for Claude"
  2. "AI Calendar Assistant | $5"
  3. "MCP Server for Google Cal"
  4. "Connect Calendar to Claude"
  5. "One-Time $5 | No Subscription"
  6. "Works with Cursor & Windsurf"
- Descriptions (max 90 chars each):
  1. "Give your AI assistant access to Google Calendar. One-time payment, instant setup."
  2. "Read, create, and manage calendar events from Claude, Cursor, or Windsurf. $5 forever."

**Sitelinks:**
- "Pricing" → /pricing
- "Setup Guide" → /setup
- "Privacy Policy" → /privacy

#### Ad Copy (mcpoutlook.com)

**Responsive Search Ad:**
- Headlines:
  1. "Outlook MCP for Claude"
  2. "AI Email Assistant | $5"
  3. "MCP Server for Outlook"
  4. "Connect Outlook to Claude"
  5. "One-Time $5 | No Subscription"
  6. "Works with Cursor & Windsurf"
- Descriptions:
  1. "Give your AI assistant access to Outlook email and calendar. One-time payment, instant setup."
  2. "Read, send, and manage emails from Claude, Cursor, or Windsurf. $5 forever."

**Sitelinks:**
- "Pricing" → /pricing
- "Setup Guide" → /setup
- "Privacy Policy" → /privacy

### 3.2 Meta Ads: Awareness + Conversion Campaigns

**Campaign structure:**

#### Campaign 1: Conversions (both products)

- Objective: Sales / Conversions
- Optimization: Purchase event
- Budget: $15-25/day
- Placement: Facebook Feed, Instagram Feed, Instagram Stories (disable Audience Network)

**Audience targeting:**
- Ages: 22-45
- Interests (layer these with AND/OR):
  - Software development, Programming, GitHub, VS Code
  - Artificial Intelligence, Machine Learning, Large Language Models
  - Claude AI, ChatGPT, GitHub Copilot
  - Productivity tools, Developer tools
- Exclude: People who already purchased (custom audience from Pixel)

**Ad formats:**
- Single image or short video (15s screen recording of MCP in action)
- Carousel: Step 1 → Step 2 → Step 3 showing setup flow

**Ad copy template:**
- Primary text: "Your AI assistant can now read and manage your [Google Calendar/Outlook]. One command, $5, works forever. No subscription."
- Headline: "Connect [Google Calendar/Outlook] to Claude"
- CTA: "Get Started"
- Link: gcalmcp.com or mcpoutlook.com

#### Campaign 2: Retargeting

- Audience: Website visitors who didn't purchase (Pixel-based, last 30 days)
- Budget: $5-10/day
- Ad copy: "Still thinking about it? $5 once, full refund anytime."

---

## Phase 4: Creative Assets (partially automatable)

- [ ] Screen recording: 30s GIF/video showing Claude reading calendar events
- [ ] Screen recording: 30s GIF/video showing Claude sending an email
- [ ] Static images: dark-themed cards matching website aesthetic (1200x628 for Feed, 1080x1920 for Stories)
- [ ] Use website screenshots/hero section as base
- [ ] Tools: Can use Figma, or screenshot the website demo section

---

## Phase 5: Launch & Optimize (ongoing)

### Week 1
- [ ] Launch all campaigns with broad targeting
- [ ] Check conversion tracking fires correctly (Google Ads Tag Assistant, Meta Pixel Helper)
- [ ] Add negative keywords to Google (e.g., "free", "google calendar app", "outlook download")

### Week 2
- [ ] Review search term reports, add negatives, promote good terms to exact match
- [ ] Pause underperforming ad groups (CPA > $5 means losing money)
- [ ] On Meta: kill ad sets with CTR < 1% after 1000 impressions

### Week 3+
- [ ] Build lookalike audience from purchasers (once you have 50+ conversions on Meta)
- [ ] Test new ad copy variations
- [ ] Scale budget on winning ad groups/audiences
- [ ] Consider YouTube ads (short pre-roll showing the product)

---

## Budget Summary

| Platform | Daily | Monthly | Notes |
|----------|-------|---------|-------|
| Google Ads (gcalmcp) | $10-20 | $300-600 | Search intent, high conversion |
| Google Ads (outlook) | $10-20 | $300-600 | Search intent, high conversion |
| Meta (conversions) | $15-25 | $450-750 | Broader reach, lower intent |
| Meta (retargeting) | $5-10 | $150-300 | High ROI on warm audience |
| **Total** | **$40-75** | **$1,200-2,250** | Break-even: 240-450 sales/month |

At $5/sale, need 240-450 purchases/month to break even. Target ROAS: 2-3x.

---

## Quick Reference: IDs to Collect

| Item | Value | Status |
|------|-------|--------|
| Google Ads Account ID | AW-___________ | [ ] Pending |
| Google Ads Conversion Label (gcal) | ____________ | [ ] Pending |
| Google Ads Conversion Label (outlook) | ____________ | [ ] Pending |
| Meta Pixel ID | ____________ | [ ] Pending |
| Meta Business ID | ____________ | [ ] Pending |
