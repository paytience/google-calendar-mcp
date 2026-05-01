"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import type { DemoPhase } from "./use-demo-sequence";

const MESSAGE = "Schedule a meeting with Sarah tomorrow at 2pm";

const TOOL_PARAMS = `{
  subject: "Meeting with Sarah",
  start: "2025-05-02T14:00:00",
  end: "2025-05-02T15:00:00"
}`;

function getTypingDelay(): number {
  const base = 45;
  const variance = Math.random() * 40 - 15; // -15 to +25ms
  // Occasional longer pause (simulating thought)
  if (Math.random() < 0.08) return base + 80;
  return Math.max(25, base + variance);
}

export function ChatPanel({ phase }: { phase: DemoPhase }) {
  const [charIndex, setCharIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = phase === "typing";
  const showToolCall = phase === "tool-call" || phase === "transition" || phase === "calendar" || phase === "hold";
  const showResponse = phase === "calendar" || phase === "hold";

  // Reset typewriter on new cycle
  useEffect(() => {
    if (phase === "typing") {
      setCharIndex(0);
    }
  }, [phase]);

  // Typewriter effect with randomized delays
  useEffect(() => {
    if (!isTyping) return;
    if (charIndex >= MESSAGE.length) return;

    timerRef.current = setTimeout(() => {
      setCharIndex((i) => i + 1);
    }, getTypingDelay());

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTyping, charIndex]);

  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 md:py-3 border-b border-zinc-800 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
        <span className="ml-2 text-[11px] text-zinc-500">Claude Code</span>
      </div>

      {/* Chat content */}
      <div className="flex-1 p-4 md:p-5 font-mono text-xs md:text-sm text-left space-y-3 overflow-hidden">
        {/* User message */}
        <div className="flex items-start gap-2">
          <span className="text-zinc-500 shrink-0">&gt;</span>
          <span className="text-zinc-200">
            {MESSAGE.slice(0, charIndex)}
            {isTyping && charIndex < MESSAGE.length && (
              <span className="demo-cursor">|</span>
            )}
          </span>
        </div>

        {/* Tool call */}
        {showToolCall && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="pl-4 space-y-2"
          >
            {/* Thinking shimmer */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-xs text-zinc-500">Thinking...</span>
            </motion.div>

            {/* Tool badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                <span className="text-[10px] md:text-[11px] text-blue-400 font-medium">create_calendar_event</span>
              </div>
              <pre className="mt-2 text-[10px] md:text-[11px] text-zinc-500 leading-relaxed">{TOOL_PARAMS}</pre>
            </motion.div>
          </motion.div>
        )}

        {/* Success response */}
        {showResponse && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pl-4 flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs text-green-400">Event created successfully</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
