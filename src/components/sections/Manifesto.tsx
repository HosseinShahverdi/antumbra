"use client";

/* eslint-disable @next/next/no-img-element -- inline pill images inside running text */
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IMAGES, type ImageSlug } from "@/lib/images.generated";

type Token = { w: string; serif?: boolean } | { pill: ImageSlug; pos?: string };

const TEXT: Token[] = [
  { w: "We" },
  { w: "make" },
  { w: "crowns", serif: true },
  { pill: "material-macro", pos: "50% 50%" },
  { w: "for" },
  { w: "the" },
  { w: "hour" },
  { w: "the" },
  { w: "light" },
  { w: "goes" },
  { w: "out." },
  { w: "Not" },
  { w: "costume," },
  { w: "not" },
  { w: "disguise" },
  { w: "—" },
  { w: "architecture", serif: true },
  { w: "for" },
  { w: "the" },
  { w: "head," },
  { pill: "atelier-hands", pos: "40% 70%" },
  { w: "filed," },
  { w: "beaded" },
  { w: "and" },
  { w: "blackened" },
  { w: "by" },
  { w: "hand" },
  { w: "in" },
  { w: "editions" },
  { w: "of" },
  { w: "nine," },
  { w: "for" },
  { w: "people" },
  { w: "who" },
  { w: "arrive" },
  { w: "once" },
  { w: "the" },
  { w: "room" },
  { w: "is" },
  { w: "already" },
  { w: "dark.", serif: true },
  { pill: "umbra", pos: "50% 30%" },
];

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const words = gsap.utils.toArray<HTMLElement>("[data-mf-word]");
      const pills = gsap.utils.toArray<HTMLElement>("[data-mf-pill]");
      gsap.fromTo(
        words,
        { opacity: 0.13 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-mf-text]", start: "top 78%", end: "bottom 52%", scrub: true },
        },
      );
      pills.forEach((p) => {
        gsap.fromTo(
          p,
          { width: "0.4em", opacity: 0.2 },
          {
            width: "1.9em",
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: p, start: "top 82%", end: "top 58%", scrub: true },
          },
        );
      });
      gsap.from("[data-mf-meta]", {
        y: 20,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1.2,
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="manifesto" aria-labelledby="manifesto-title" className="relative bg-ink px-[var(--gutter)] py-[clamp(6rem,18vh,12rem)]">
      <div className="mb-12 flex items-center justify-between lg:mb-20">
        <h2 id="manifesto-title" data-mf-meta className="label text-mist">
          <span className="text-smoke">§ 01 —</span> Manifesto
        </h2>
        <p data-mf-meta className="label text-smoke">
          Read slowly
        </p>
      </div>

      <p
        data-mf-text
        className="max-w-[22ch] font-display text-[clamp(2.1rem,5.6vw,6rem)] leading-[1.02] tracking-[-0.015em] text-bone [font-variation-settings:'wdth'_112] [font-weight:280] sm:max-w-[24ch] lg:ml-[16.6%]"
      >
        {TEXT.map((t, i) =>
          "pill" in t ? (
            <span
              key={i}
              data-mf-pill
              aria-hidden="true"
              className="mx-[0.12em] inline-block h-[0.74em] w-[1.9em] translate-y-[0.04em] overflow-hidden rounded-full bg-coal align-baseline"
            >
              <img
                src={IMAGES[t.pill].srcSet.split(", ")[0].split(" ")[0]}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                style={{ objectPosition: t.pos }}
              />
            </span>
          ) : (
            <span key={i}>
              <span data-mf-word className={t.serif ? "serif-i [font-weight:400] tracking-normal" : ""}>
                {t.w}
              </span>{" "}
            </span>
          ),
        )}
      </p>

      <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:ml-[16.6%] lg:mt-24 lg:grid-cols-3">
        <p data-mf-meta className="label text-smoke">
          — The atelier, Lisbon
        </p>
        <p data-mf-meta className="max-w-sm text-[0.95rem] leading-relaxed text-mist">
          The antumbra is the shadow you stand in to see a ring of light around the moon — the eclipse where darkness never quite wins.
          We think the most interesting part of a person is that edge.
        </p>
      </div>
    </section>
  );
}
