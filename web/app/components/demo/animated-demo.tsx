"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useDemoSequence } from "./use-demo-sequence";
import { ChatPanel } from "./chat-panel";
import { CalendarPanel } from "./calendar-panel";

export function AnimatedDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.4 });
  const reducedMotion = useReducedMotion() ?? false;
  const { phase } = useDemoSequence(isInView, reducedMotion);

  const showCalendar = phase === "transition" || phase === "calendar" || phase === "hold";

  // Static fallback for reduced motion
  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl shadow-blue-500/5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-[500px] md:h-[340px]">
          <ChatPanel phase="calendar" />
          <CalendarPanel phase="calendar" mobile={false} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl shadow-blue-500/5"
    >
      <div className="relative h-[320px] md:h-[340px] overflow-hidden">
        {/* Chat panel */}
        <motion.div
          className="absolute inset-0 p-3 md:p-4"
          animate={{
            y: showCalendar ? "-8%" : "0%",
            x: showCalendar ? "0%" : "0%",
            scale: showCalendar ? 0.88 : 1,
            opacity: showCalendar ? 0 : 1,
            filter: showCalendar ? "blur(4px)" : "blur(0px)",
          }}
          transition={{
            duration: 0.7,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          <ChatPanel phase={phase} />
        </motion.div>

        {/* Calendar panel */}
        <motion.div
          className="absolute inset-0 p-3 md:p-4"
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: showCalendar ? "0%" : "100%",
            opacity: showCalendar ? 1 : 0,
          }}
          transition={{
            duration: 0.7,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          <CalendarPanel phase={phase} mobile={true} />
        </motion.div>

        {/* Phase indicator dots */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              !showCalendar ? "bg-blue-400" : "bg-zinc-700"
            }`}
          />
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              showCalendar ? "bg-blue-400" : "bg-zinc-700"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
