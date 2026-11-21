"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit", hour12: false });

/** Local time at the atelier. Renders a neutral placeholder until mounted. */
export function Clock({ className = "", prefix = "LIS" }: { className?: string; prefix?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 15_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return (
    <span className={className}>
      {prefix} <span className="tabular-nums">{now ?? "--:--"}</span>
    </span>
  );
}
