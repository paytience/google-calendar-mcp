"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const demos = [
  {
    src: "/demo.jpg",
    alt: "Create and delete a calendar event in Claude Code",
    caption: "Create and manage events",
  },
  {
    src: "/demo2.jpg",
    alt: "Check today's calendar events with list_events",
    caption: "Check your schedule",
  },
  {
    src: "/demo3.jpg",
    alt: "Find free slots and schedule meetings with get_free_busy",
    caption: "Find available slots",
  },
  {
    src: "/demo4.jpg",
    alt: "Create recurring weekly events with recurrence rules",
    caption: "Set up recurring events",
  },
];

export function DemoCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % demos.length);
    }, 6000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const go = (index: number) => {
    setActive(index);
    resetTimer();
  };

  return (
    <div className="space-y-4">
      {/* Terminal window frame */}
      <div className="rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-950 shadow-2xl shadow-black/60">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
          </div>
          <span className="text-[11px] text-zinc-500 ml-2 font-mono">claude</span>
        </div>

        {/* Image with fade transition */}
        <div className="relative aspect-[16/9]">
          {demos.map((demo, i) => (
            <Image
              key={demo.src}
              src={demo.src}
              alt={demo.alt}
              fill
              className={`object-contain transition-opacity duration-500 ease-in-out ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
              priority={i === 0}
            />
          ))}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.4)] rounded-b-lg"></div>
        </div>
      </div>

      {/* Controls below */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => go((active - 1 + demos.length) % demos.length)}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          aria-label="Previous"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          {demos.map((demo, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`text-xs transition-colors ${
                i === active
                  ? "text-zinc-200 font-medium"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {demo.caption}
            </button>
          ))}
        </div>

        <button
          onClick={() => go((active + 1) % demos.length)}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          aria-label="Next"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
