"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NAV_LINKS } from "@/lib/data";
import { Clock } from "@/components/ui/Clock";
import { Countdown } from "@/components/ui/Countdown";
import { Icon } from "@/components/ui/Icon";
import { scrollToTarget } from "@/components/providers/SmoothScroll";

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const uid = useId();
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  useGSAP(
    () => {
      gsap.from("[data-foot-letter]", {
        yPercent: 100,
        "--wdth": 70,
        duration: 1.6,
        stagger: 0.05,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-foot-word]", start: "top bottom-=40" },
      });
    },
    { scope: root },
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setState(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "done" : "error");
  };

  return (
    <footer ref={root} className="relative overflow-hidden bg-ink text-bone" aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className="sr-only">
        Antumbra — footer
      </h2>
      <div className="grid grid-cols-1 gap-12 border-t border-bone/10 px-[var(--gutter)] pb-16 pt-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="label mb-4 text-smoke">The Night Letter</p>
          <p className="serif-i max-w-[18ch] text-[clamp(1.9rem,2.8vw,2.8rem)] leading-[1.05]">One letter per eclipse. Nothing in between.</p>
          {state === "done" ? (
            <p className="mt-8 flex items-center gap-2 text-mist" role="status">
              <Icon name="check" size={18} /> You are on the list — see you at the next totality.
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-8 flex max-w-md items-end gap-3">
              <div className="flex-1">
                <label htmlFor={`${uid}-email`} className="sr-only">
                  Email address
                </label>
                <input
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Your email"
                  className="field"
                  aria-invalid={state === "error"}
                  aria-describedby={state === "error" ? `${uid}-err` : undefined}
                  onInput={() => state === "error" && setState("idle")}
                />
                {state === "error" ? (
                  <p id={`${uid}-err`} className="mt-2 text-sm text-[#e0a29a]">
                    That address doesn’t look complete.
                  </p>
                ) : null}
              </div>
              <button type="submit" aria-label="Subscribe" className="grid size-12 shrink-0 place-items-center rounded-full ring-1 ring-bone/30 transition-colors hover:bg-bone hover:text-ink">
                <Icon name="arrowRight" size={18} />
              </button>
            </form>
          )}
        </div>

        <nav aria-label="Footer" className="md:col-span-2 md:col-start-7">
          <p className="label mb-4 text-smoke">Explore</p>
          <ul className="space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-mist transition-colors hover:text-bone">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className="label mb-4 text-smoke">Atelier</p>
          <p className="text-mist">Lisbon, by appointment</p>
          <p className="text-mist">Fittings in Paris & by video</p>
          <p className="label mt-4 text-mist">
            <Clock prefix="Local time" />
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="label mb-4 text-smoke">Next totality</p>
          <p className="text-mist">2 August 2027</p>
          <p className="text-mist">Southern Spain & North Africa</p>
          <p className="label mt-4 text-mist">
            <Countdown /> nights to go
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-bone/10 px-[var(--gutter)] py-6 text-sm text-smoke md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl">
          © 2026 Antumbra is a fictional atelier — a self-initiated brand &amp; web concept. Campaign stills are original AI-generated images made
          for this project. Icons: Solar via Iconify. Type: Anybody, Instrument Serif, Geist.
        </p>
        <button type="button" onClick={() => scrollToTarget("#top")} className="label flex items-center gap-2 self-start text-mist hover:text-bone md:self-auto">
          Back to first light <Icon name="arrowUp" size={16} />
        </button>
      </div>

      <div data-foot-word aria-hidden="true" className="pointer-events-none -mb-[3.2vw] select-none overflow-hidden px-[1vw] text-center">
        <p className="display whitespace-nowrap text-[11.2vw] leading-[0.82] text-bone [--wght:200]">
          {"ANTUMBRA".split("").map((c, i) => (
            <span key={i} data-foot-letter className="inline-block [--wdth:150]" style={{ fontVariationSettings: '"wdth" var(--wdth, 150)' }}>
              {c}
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
