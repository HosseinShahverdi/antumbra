"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IMAGES } from "@/lib/images.generated";

declare global {
  interface Window {
    __antumbraReady?: boolean;
  }
}

const PHASES = ["First contact", "Second contact", "Totality"];

export const READY_EVENT = "antumbra:ready";

function signalReady() {
  window.__antumbraReady = true;
  window.dispatchEvent(new Event(READY_EVENT));
}

/**
 * Opening eclipse: a moon crosses the sun while real assets load, then the
 * screen opens through the eclipse. Hidden entirely without JS (see layout),
 * skipped under reduced motion, and skippable by click or key.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.to(el, { autoAlpha: 0, duration: 0.3, onComplete: () => (signalReady(), setGone(true)) });
        return;
      }

      const counter = el.querySelector<HTMLElement>("[data-count]");
      const phase = el.querySelector<HTMLElement>("[data-phase]");
      const progress = { v: 0 };
      let assetsReady = false;

      // wait for display fonts + the hero still (with a ceiling so a slow network never traps the visitor)
      const hero = new Image();
      hero.src = IMAGES.hero.srcSet.split(", ")[1]?.split(" ")[0] ?? IMAGES.hero.src;
      Promise.race([
        Promise.all([document.fonts?.ready ?? Promise.resolve(), hero.decode().catch(() => undefined)]),
        new Promise((r) => setTimeout(r, 4500)),
      ]).then(() => {
        assetsReady = true;
      });

      const render = () => {
        const v = Math.round(progress.v);
        if (counter) counter.textContent = String(v).padStart(3, "0");
        if (phase) phase.textContent = PHASES[v < 45 ? 0 : v < 99 ? 1 : 2];
      };

      gsap.set("[data-moon]", { x: 0, xPercent: -112 });
      const tl = gsap.timeline();
      tl.from("[data-pre-fade]", { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.08, ease: "power2.out" })
        .to(progress, { v: 86, duration: 1.5, ease: "power1.inOut", onUpdate: render }, 0.2)
        .to("[data-moon]", { xPercent: -14, duration: 1.5, ease: "power1.inOut" }, 0.2)
        .add(() => {
          // hold at 86% until assets are in
          if (!assetsReady) {
            tl.pause();
            const wait = window.setInterval(() => {
              if (assetsReady) {
                window.clearInterval(wait);
                tl.resume();
              }
            }, 80);
          }
        })
        .to(progress, { v: 100, duration: 0.7, ease: "power2.in", onUpdate: render })
        .to("[data-moon]", { xPercent: 0, duration: 0.7, ease: "power2.in" }, "<")
        .to("[data-corona]", { opacity: 1, scale: 1.06, duration: 0.5, ease: "power2.out" }, "-=0.08")
        .to("[data-sun]", { opacity: 0, duration: 0.3 }, "<")
        .to("[data-pre-fade]", { autoAlpha: 0, y: -10, duration: 0.5, stagger: 0.04, ease: "power2.in" }, "+=0.25")
        .add(signalReady, "-=0.1")
        .to(el, { "--hole": "150vmax", duration: 1.5, ease: "expo.inOut" }, "-=0.2")
        .add(() => setGone(true));

      const skip = () => {
        tl.progress(1);
      };
      el.addEventListener("click", skip);
      window.addEventListener("keydown", skip, { once: true });
      return () => {
        el.removeEventListener("click", skip);
        window.removeEventListener("keydown", skip);
      };
    },
    { scope: root },
  );

  if (gone) return null;

  return (
    <div ref={root} className="preloader fixed inset-0 z-[95] flex cursor-wait flex-col items-center justify-center bg-ink text-bone" aria-hidden="true">
      <div className="relative size-[min(34vw,11rem)]">
        {/* corona that blooms at totality */}
        <div
          data-corona
          className="absolute inset-0 rounded-full opacity-0"
          style={{ boxShadow: "0 0 0 1px rgba(239,236,229,.9), 0 0 32px 6px rgba(239,236,229,.55), 0 0 120px 30px rgba(239,236,229,.18)" }}
        />
        <div data-sun className="absolute inset-0 rounded-full bg-bone" />
        <div data-moon className="absolute inset-[-1%] rounded-full bg-ink" style={{ transform: "translateX(-112%)" }} />
      </div>

      <div className="label absolute bottom-[var(--gutter)] left-[var(--gutter)] right-[var(--gutter)] flex items-end justify-between">
        <span data-pre-fade>
          <span className="block text-smoke">Antumbra</span>
          <span data-phase>First contact</span>
        </span>
        <span data-pre-fade className="display text-[clamp(3rem,9vw,7rem)] tabular-nums [--wght:200] [--wdth:110]" data-count>
          000
        </span>
      </div>
      <p data-pre-fade className="label absolute top-[var(--gutter)] left-1/2 -translate-x-1/2 text-smoke">
        Eclipse atelier · Lisbon
      </p>
    </div>
  );
}
