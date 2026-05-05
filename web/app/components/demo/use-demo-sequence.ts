"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export type DemoPhase =
  | "typing"
  | "tool-call"
  | "transition"
  | "calendar"
  | "hold";

const PHASE_DURATIONS: Record<DemoPhase, number> = {
  typing: 3000,
  "tool-call": 3000,
  transition: 1000,
  calendar: 3500,
  hold: 2500,
};

const PHASE_ORDER: DemoPhase[] = [
  "typing",
  "tool-call",
  "transition",
  "calendar",
  "hold",
];

export function useDemoSequence(isInView: boolean, reducedMotion: boolean) {
  const [phase, setPhase] = useState<DemoPhase>("typing");
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advancePhase = useCallback(() => {
    setPhase((current) => {
      const idx = PHASE_ORDER.indexOf(current);
      if (idx === PHASE_ORDER.length - 1) {
        setCycle((c) => c + 1);
        return PHASE_ORDER[0];
      }
      return PHASE_ORDER[idx + 1];
    });
  }, []);

  useEffect(() => {
    if (reducedMotion || !isInView) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const duration = PHASE_DURATIONS[phase];
    timerRef.current = setTimeout(advancePhase, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, isInView, reducedMotion, advancePhase, cycle]);

  // Pause when tab is hidden
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const restart = useCallback(() => {
    setPhase("typing");
    setCycle((c) => c + 1);
  }, []);

  return { phase, restart };
}
