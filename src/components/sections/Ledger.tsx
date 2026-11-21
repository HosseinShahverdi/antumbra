"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { LEDGER } from "@/lib/data";
import { Picture } from "@/components/ui/Picture";
import { SplitWords } from "@/components/ui/SplitWords";

export function Ledger() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("#ledger-title .split-inner", {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: "#ledger-title", start: "top 85%" },
      });
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>("[data-ledger-row]").forEach((row) => {
        const num = row.querySelector<HTMLElement>("[data-num]");
        const value = Number(num?.dataset.value ?? 0);
        const pad = Number(num?.dataset.pad ?? 2);
        const from = value === 0 ? 12 : 0;
        const counter = { v: from };
        const render = () => {
          if (num) num.textContent = String(Math.round(counter.v)).padStart(pad, "0");
        };
        render();
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 80%" } });
        tl.from(row.querySelector("[data-rule]"), { scaleX: 0, duration: 1.4, ease: "expo.inOut" })
          .to(counter, { v: value, duration: 1.8, ease: "power3.out", onUpdate: render }, 0.2)
          .from(row.querySelectorAll("[data-ledger-fade]"), { y: 24, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: "power3.out" }, 0.3);
      });

      gsap.utils.toArray<HTMLElement>("[data-ledger-parallax]").forEach((el, i) => {
        gsap.fromTo(
          el.querySelector("img"),
          { yPercent: -8, scale: 1.15 },
          { yPercent: 8, scale: 1.15, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.from(el, { clipPath: i % 2 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 80%" } });
      });
    },
    { scope: root },
  );

  const row = (item: (typeof LEDGER)[number]) => (
    <div key={item.title} data-ledger-row className="relative grid grid-cols-1 gap-4 py-8 md:grid-cols-12 md:gap-6 md:py-12">
      <span data-rule aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-ink/25" />
      <p className="display text-[clamp(5.5rem,15vw,15rem)] leading-[0.8] tabular-nums md:col-span-6 [--wght:170]">
        <span className="sr-only">
          {item.value} — {item.title}
        </span>
        <span data-num data-value={item.value} data-pad={item.pad} aria-hidden="true">
          {String(item.value).padStart(item.pad, "0")}
        </span>
      </p>
      <h3 data-ledger-fade className="display self-end text-[clamp(1.3rem,1.7vw,1.7rem)] [--wght:360] md:col-span-2 md:col-start-7">
        {item.title}
      </h3>
      <p data-ledger-fade className="max-w-md self-end leading-relaxed text-iron md:col-span-4 md:col-start-9">
        {item.body}
      </p>
    </div>
  );

  return (
    <section ref={root} id="ledger" aria-labelledby="ledger-title" className="relative bg-paper px-[var(--gutter)] py-[clamp(6rem,16vh,11rem)] text-ink">
      <div className="mb-14 grid grid-cols-1 gap-8 md:mb-20 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="label mb-6 text-iron">
            <span className="text-smoke">§ 04 —</span> The ledger
          </p>
          <SplitWords as="h2" id="ledger-title" text="Nine, never ten." className="display text-[clamp(3rem,7.4vw,7.6rem)] [--wght:210]" />
        </div>
        <p className="serif-i self-end text-[clamp(1.5rem,2.1vw,2.1rem)] leading-[1.1] md:col-span-4 md:col-start-9">
          Four numbers we keep on the wall above the bench. They decide everything else.
        </p>
      </div>

      {row(LEDGER[0])}
      {row(LEDGER[1])}

      <div className="my-10 grid grid-cols-1 gap-6 md:my-16 md:grid-cols-12">
        <figure className="md:col-span-4">
          <div data-ledger-parallax className="relative aspect-[4/5] overflow-hidden">
            <Picture
              slug="atelier-hands"
              alt="Hands at a dark workbench filing a thin blackened-brass filament held in a jeweller's vice."
              sizes="(min-width: 768px) 33vw, 100vw"
              className="absolute inset-0"
            />
          </div>
          <figcaption className="label mt-3 flex justify-between text-iron">
            <span>Fig. 01</span>
            <span>Filing filament 117 of 214</span>
          </figcaption>
        </figure>
        <figure className="md:col-span-7 md:col-start-6 md:self-end">
          <div data-ledger-parallax className="relative aspect-[16/9] overflow-hidden">
            <Picture
              slug="material-macro"
              alt="Macro of blackened filaments and tiny polished beads arranged in a radial burst on black velvet."
              sizes="(min-width: 768px) 58vw, 100vw"
              className="absolute inset-0"
            />
          </div>
          <figcaption className="label mt-3 flex justify-between text-iron">
            <span>Fig. 02</span>
            <span>A Corona, laid out before setting</span>
          </figcaption>
        </figure>
      </div>

      {row(LEDGER[2])}
      {row(LEDGER[3])}
      <div aria-hidden="true" className="h-px bg-ink/25" />
    </section>
  );
}
