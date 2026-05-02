"use client";

import { track } from "@vercel/analytics";

export function TrackedCTA({
  href,
  children,
  source,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  source: string;
  variant?: "primary" | "secondary";
}) {
  const baseClasses = "inline-flex items-center justify-center px-7 py-3 font-semibold rounded-lg transition-all duration-200";
  const variants = {
    primary: "bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg shadow-white/10 hover:shadow-white/20",
    secondary: "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/50",
  };

  return (
    <a
      href={href}
      onClick={() => track("get_started_click", { source })}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </a>
  );
}
