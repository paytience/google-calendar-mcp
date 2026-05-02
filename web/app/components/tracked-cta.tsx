"use client";

import { track } from "@vercel/analytics";

export function TrackedCTA({ href, children, source }: { href: string; children: React.ReactNode; source: string }) {
  return (
    <a
      href={href}
      onClick={() => track("get_started_click", { source })}
      className="px-8 py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
    >
      {children}
    </a>
  );
}
