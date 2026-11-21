"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, isFinePointer, prefersReducedMotion } from "@/lib/gsap";

/**
 * An annulus cursor: a dot plus a lagging ring that widens over interactive
 * elements and shows a label from [data-cursor]. Fine pointers only — touch,
 * keyboard and coarse pointers keep the native behaviour.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useGSAP(() => {
    if (!isFinePointer()) return;
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;
    const reduced = prefersReducedMotion();
    document.documentElement.classList.add("has-cursor");

    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "none" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "none" });
    const rx = gsap.quickTo(r, "x", { duration: reduced ? 0.01 : 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: reduced ? 0.01 : 0.45, ease: "power3.out" });
    let visible = false;
    let current = "";

    const show = (v: boolean) => {
      if (v === visible) return;
      visible = v;
      gsap.to([d, r], { autoAlpha: v ? 1 : 0, duration: 0.3, overwrite: "auto" });
    };

    let lastX = -1;
    let lastY = -1;
    const resolve = (el: Element | null) => {
      const t = (el as HTMLElement | null)?.closest?.<HTMLElement>("[data-cursor], a, button, input, select, textarea, label, [role='slider']");
      const next = t ? (t.dataset.cursor ?? "·") : "";
      if (next !== current) {
        current = next;
        setLabel(next === "·" ? "" : next);
        gsap.to(r, {
          scale: next ? (next === "·" ? 1.6 : 2.6) : 1,
          backgroundColor: next && next !== "·" ? "rgba(239,236,229,1)" : "rgba(239,236,229,0)",
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(d, { scale: next ? 0 : 1, duration: 0.3, overwrite: "auto" });
      }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      show(true);
      lastX = e.clientX;
      lastY = e.clientY;
      dx(lastX);
      dy(lastY);
      rx(lastX);
      ry(lastY);
      resolve(e.target as Element | null);
    };
    // content moves under a still pointer while scrolling — re-check what is under it
    let pending = 0;
    const onScroll = () => {
      if (pending || lastX < 0) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        resolve(document.elementFromPoint(lastX, lastY));
      });
    };
    const hide = () => show(false);
    const down = () => gsap.to(r, { scale: "-=0.25", duration: 0.2 });
    const up = () => gsap.to(r, { scale: current ? (current === "·" ? 1.6 : 2.6) : 1, duration: 0.4 });
    const onVis = () => document.hidden && hide();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      cancelAnimationFrame(pending);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", onVis);
    };
  });

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden mix-blend-difference [@media(hover:hover)_and_(pointer:fine)]:block">
      <div ref={dot} className="invisible absolute left-0 top-0 -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-bone opacity-0" />
      <div
        ref={ring}
        className="invisible absolute left-0 top-0 -ml-5 -mt-5 grid size-10 place-items-center rounded-full opacity-0 ring-1 ring-bone"
      >
        <span className="label text-[0.36rem] tracking-[0.18em] text-ink">{label}</span>
      </div>
    </div>
  );
}
