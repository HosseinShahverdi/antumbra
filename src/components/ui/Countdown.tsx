"use client";

import { useEffect, useState } from "react";
import { NEXT_TOTALITY } from "@/lib/data";

/** Nights until the next total eclipse over Iberia — computed in the viewer's browser. */
export function Countdown({ className = "" }: { className?: string }) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setDays(Math.max(0, Math.ceil((NEXT_TOTALITY.getTime() - Date.now()) / 86_400_000)));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 3_600_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return <span className={`tabular-nums ${className}`}>{days === null ? "———" : String(days).padStart(3, "0")}</span>;
}
