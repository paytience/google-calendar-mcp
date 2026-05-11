export function trackConversion(value: number, currency = "USD") {
  // Google Ads conversion
  const gadsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (gadsId && conversionLabel && typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: `${gadsId}/${conversionLabel}`,
      value,
      currency,
    });
  }

  // Meta Pixel purchase event
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "Purchase", { value, currency });
  }
}

export function trackInitiateCheckout(value: number, currency = "USD") {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "begin_checkout", { value, currency });
  }
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "InitiateCheckout", { value, currency });
  }
}

export function trackLead() {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "generate_lead");
  }
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "Lead");
  }
}
