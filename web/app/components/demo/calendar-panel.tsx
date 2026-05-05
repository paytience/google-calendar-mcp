"use client";

import { motion } from "motion/react";
import type { DemoPhase } from "./use-demo-sequence";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const MOBILE_HOURS = [10, 11, 12, 13, 14, 15, 16];

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return String(d.getDate());
  });
}

function getMonthYear(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const EXISTING_EVENTS = [
  { day: 0, hour: 9, duration: 0.5, label: "Standup", muted: true },
  { day: 2, hour: 12, duration: 1, label: "Lunch", muted: true },
  { day: 4, hour: 10, duration: 1, label: "1:1 with Mike", muted: true },
];

// Events visible in mobile day-view (Wed only)
const MOBILE_EVENTS = [
  { hour: 12, duration: 1, label: "Lunch", muted: true },
];

function formatHour(h: number) {
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export function CalendarPanel({ phase, mobile }: { phase: DemoPhase; mobile?: boolean }) {
  const showNewEvent = phase === "calendar" || phase === "hold";
  const dates = getWeekDates();
  const monthYear = getMonthYear();

  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 md:py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[11px] font-medium text-zinc-300">Google Calendar</span>
        </div>
        <span className="text-[10px] text-zinc-500">{monthYear}</span>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile: day-view */}
        {mobile && (
          <div className="block md:hidden h-full">
            <div className="grid grid-cols-[36px_1fr] h-full">
              {/* Day header */}
              <div className="border-b border-zinc-800/50"></div>
              <div className="flex flex-col items-center justify-center py-1.5 border-b border-zinc-800/50 bg-blue-500/5">
                <span className="text-[9px] text-zinc-500 uppercase">Wed</span>
                <span className="text-[11px] font-medium text-blue-400">7</span>
              </div>

              {/* Time slots */}
              {MOBILE_HOURS.map((hour) => (
                <div key={hour} className="contents">
                  <div className="flex items-start justify-end pr-2 pt-0.5 border-t border-zinc-800/30">
                    <span className="text-[8px] text-zinc-600">{formatHour(hour)}</span>
                  </div>
                  <div className="relative border-t border-zinc-800/30 min-h-[32px] bg-blue-500/5">
                    {/* Existing mobile events */}
                    {MOBILE_EVENTS.filter((e) => e.hour === hour).map((event) => (
                      <div
                        key={event.label}
                        className="absolute inset-x-1 top-0.5 bg-zinc-800/60 border-l-2 border-zinc-600 rounded-sm px-1.5 py-0.5"
                        style={{ height: `${event.duration * 32 - 4}px` }}
                      >
                        <span className="text-[9px] text-zinc-400">{event.label}</span>
                      </div>
                    ))}

                    {/* New animated event */}
                    {showNewEvent && hour === 14 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: 0.3,
                        }}
                        className="absolute inset-x-1 top-0.5 bg-blue-500/20 border-l-2 border-blue-400 rounded-sm px-1.5 py-0.5 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        style={{ height: "28px" }}
                      >
                        <span className="text-[9px] text-blue-300 font-medium">Meeting with Sarah</span>
                        <span className="block text-[8px] text-blue-400/60">2:00 PM</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: week-view */}
        <div className={mobile ? "hidden md:block h-full" : "h-full"}>
          <div className="grid grid-cols-[40px_repeat(5,1fr)] h-full">
            {/* Day headers */}
            <div className="border-b border-zinc-800/50"></div>
            {DAYS.map((day, i) => (
              <div
                key={day}
                className={`flex flex-col items-center justify-center py-1.5 border-b border-zinc-800/50 ${
                  i === 2 ? "bg-blue-500/5" : ""
                }`}
              >
                <span className="text-[9px] text-zinc-500 uppercase">{day}</span>
                <span className={`text-[11px] font-medium ${i === 2 ? "text-blue-400" : "text-zinc-400"}`}>
                  {dates[i]}
                </span>
              </div>
            ))}

            {/* Time slots */}
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                {/* Time label */}
                <div className="flex items-start justify-end pr-2 pt-0.5 border-t border-zinc-800/30">
                  <span className="text-[8px] text-zinc-600">{formatHour(hour)}</span>
                </div>
                {/* Day columns */}
                {DAYS.map((day, dayIdx) => (
                  <div
                    key={`${day}-${hour}`}
                    className={`relative border-t border-l border-zinc-800/30 min-h-[28px] ${
                      dayIdx === 2 ? "bg-blue-500/5" : ""
                    }`}
                  >
                    {/* Existing events */}
                    {EXISTING_EVENTS.filter(
                      (e) => e.day === dayIdx && e.hour === hour
                    ).map((event) => (
                      <div
                        key={event.label}
                        className="absolute inset-x-0.5 top-0.5 bg-zinc-800/60 border-l-2 border-zinc-600 rounded-sm px-1 py-0.5 overflow-hidden"
                        style={{ height: `${event.duration * 28 - 4}px` }}
                      >
                        <span className="text-[8px] text-zinc-400 leading-none">
                          {event.label}
                        </span>
                      </div>
                    ))}

                    {/* New animated event */}
                    {showNewEvent && dayIdx === 2 && hour === 14 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: 0.3,
                        }}
                        className="absolute inset-x-0.5 top-0.5 bg-blue-500/20 border-l-2 border-blue-400 rounded-sm px-1 py-0.5 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        style={{ height: "24px" }}
                      >
                        <span className="text-[8px] text-blue-300 font-medium leading-none">
                          Meeting with Sarah
                        </span>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
