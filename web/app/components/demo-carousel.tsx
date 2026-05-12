"use client";

import Image from "next/image";
import { useState } from "react";

const demos = [
  {
    src: "/demo.jpg",
    alt: "Create and delete a calendar event in Claude Code",
  },
  {
    src: "/demo2.jpg",
    alt: "Check today's calendar events with list_events",
  },
  {
    src: "/demo3.jpg",
    alt: "Find free slots and schedule meetings with get_free_busy",
  },
  {
    src: "/demo4.jpg",
    alt: "Create recurring weekly events with recurrence rules",
  },
];

export function DemoCarousel() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative">
      <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/50">
        <Image
          src={demos[active].src}
          alt={demos[active].alt}
          width={1232}
          height={528}
          className="w-full h-auto"
          priority={active === 0}
        />
      </div>

      {demos.length > 1 && (
        <>
          <button
            onClick={() => setActive((active - 1 + demos.length) % demos.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors"
            aria-label="Previous"
          >
            <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setActive((active + 1) % demos.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors"
            aria-label="Next"
          >
            <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {demos.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === active ? "bg-blue-400" : "bg-zinc-700 hover:bg-zinc-600"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
