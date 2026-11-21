"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion, isFinePointer } from "@/lib/gsap";
import { Picture } from "@/components/ui/Picture";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { READY_EVENT } from "./Preloader";

const WORD = "ANTUMBRA".split("");

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const aperture = section.querySelector<HTMLElement>("[data-aperture]");
      if (!aperture) return;
      const reduced = prefersReducedMotion();

      /* ── the pointer is the light ─────────────────────────────── */
      const light = { x: 58, y: 34, r: 0 };
      const apply = () => {
        aperture.style.setProperty("--lx", `${light.x}%`);
        aperture.style.setProperty("--ly", `${light.y}%`);
        aperture.style.setProperty("--lr", `${light.r}%`);
      };
      apply();

      if (reduced) {
        Object.assign(light, { x: 52, y: 40, r: 70 });
        apply();
        return;
      }

      const xTo = gsap.quickTo(light, "x", { duration: 1.1, ease: "power3.out", onUpdate: apply });
      const yTo = gsap.quickTo(light, "y", { duration: 1.1, ease: "power3.out", onUpdate: apply });
      const rTo = gsap.quickTo(light, "r", { duration: 1.2, ease: "power3.out", onUpdate: apply });

      // idle orbit (always on touch, after 2.4 s of stillness on desktop)
      const orbit = { a: -0.6 };
      const orbitTween = gsap.to(orbit, {
        a: Math.PI * 2 - 0.6,
        duration: 16,
        ease: "none",
        repeat: -1,
        paused: true,
        onUpdate: () => {
          xTo(50 + Math.cos(orbit.a) * 22);
          yTo(42 + Math.sin(orbit.a) * 20);
        },
      });
      let idle: number | undefined;
      const wake = () => {
        orbitTween.pause();
        window.clearTimeout(idle);
        idle = window.setTimeout(() => orbitTween.play(), 2400);
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch" && e.type === "pointermove" && e.buttons === 0) return;
        const r = aperture.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        const inside = Math.hypot(x - 50, y - 50) < 56;
        xTo(x);
        yTo(y);
        rTo(inside ? 40 : 24);
        wake();
      };
      const onLeave = () => {
        rTo(34);
        wake();
      };
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerdown", onMove);
      section.addEventListener("pointerleave", onLeave);
      window.addEventListener("blur", onLeave);

      /* ── intro, after the preloader opens ─────────────────────── */
      const intro = () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from("[data-ap-inner]", { scale: 0.78, autoAlpha: 0, duration: 2.2 }, 0)
          .from("[data-dial]", { rotate: -90, autoAlpha: 0, duration: 2.6, stagger: 0.15 }, 0.1)
          .fromTo(light, { r: 0 }, { r: 34, duration: 2.4, ease: "power2.inOut", onUpdate: apply }, 0.5)
          .from("[data-letter]", { yPercent: 108, "--wdth": 62, duration: 1.8, stagger: 0.055 }, 0.25)
          .from("[data-hero-fade]", { y: 26, autoAlpha: 0, duration: 1.4, stagger: 0.08 }, 0.9)
          .from("[data-nav-inner]", { yPercent: -120, duration: 1.2 }, 1.1)
          .add(() => {
            if (!isFinePointer()) orbitTween.play();
            else wake();
          }, 1.6);
      };
      if (window.__antumbraReady) intro();
      else window.addEventListener(READY_EVENT, intro, { once: true });

      /* ── scrolling out eclipses the hero ──────────────────────── */
      const out = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          onToggle: (self) => {
            if (!self.isActive) orbitTween.pause();
          },
        },
      });
      out
        .fromTo("[data-moon]", { x: 0, xPercent: -104 }, { x: 0, xPercent: 0, ease: "power1.out", duration: 0.75 }, 0)
        // the aperture drifts down against the scroll so the eclipse plays out in view
        .to("[data-ap-scroll]", { scale: 0.8, yPercent: 46, ease: "none" }, 0)
        .to("[data-dial]", { rotate: "+=70", ease: "none" }, 0)
        .fromTo("[data-rim-glow]", { opacity: 0 }, { opacity: 1, ease: "power2.in" }, 0.15)
        .to("[data-wordmark]", { letterSpacing: "0.08em", yPercent: -40, autoAlpha: 0, ease: "power1.in" }, 0)
        .to("[data-hero-out]", { y: -60, autoAlpha: 0, ease: "power1.in", stagger: 0.02 }, 0);

      return () => {
        window.clearTimeout(idle);
        window.removeEventListener(READY_EVENT, intro);
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerdown", onMove);
        section.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("blur", onLeave);
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink pb-10 lg:block lg:h-[100svh] lg:min-h-[46rem] lg:pb-0"
    >
      {/* soft vignette */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_58%_50%,#1b1b1d_0%,#0b0b0c_55%,#09090a_100%)]" />

      {/* ── aperture (the sun) ───────────────────────────── */}
      <div
        data-aperture
        data-cursor="Light"
        className="aperture relative mx-auto mt-[calc(var(--nav-h)+1.5rem)] aspect-square w-[84vw] max-w-[34rem] touch-pan-y lg:absolute lg:left-[57%] lg:top-[51%] lg:mt-0 lg:w-[min(80svh,47vw)] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2"
      >
        <div data-ap-scroll className="absolute inset-0">
          <div data-ap-inner className="absolute inset-0">
            <div data-dial aria-hidden="true" className="dial absolute -inset-[6.5%] text-bone/30" />
            <div data-dial aria-hidden="true" className="dial-major absolute -inset-[6.5%] text-bone/55" />
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <Picture
                slug="hero"
                alt=""
                decorative
                priority
                sizes="(min-width: 1024px) 80vh, 84vw"
                className="absolute inset-0"
                imgClassName="brightness-[.26] contrast-[1.15] saturate-0"
                position="50% 40%"
              />
              <Picture
                slug="hero"
                alt="A model with eyes closed in front of a large black disc rimmed with light, like a total eclipse."
                priority
                sizes="(min-width: 1024px) 80vh, 84vw"
                className="aperture-lit absolute inset-0 !bg-none"
                imgClassName="contrast-[1.05]"
                position="50% 40%"
              />
              <div data-moon aria-hidden="true" className="absolute -inset-px rounded-full bg-ink" style={{ transform: "translateX(-104%)" }} />
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-bone/25" />
            <div
              data-rim-glow
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full opacity-0"
              style={{ boxShadow: "0 0 0 1.5px rgba(239,236,229,.95), 0 0 26px 4px rgba(239,236,229,.5), 0 0 110px 24px rgba(239,236,229,.16)" }}
            />
          </div>
        </div>
      </div>

      {/* ── wordmark ───────────────────────────── */}
      <h1
        id="hero-title"
        data-wordmark
        className="display pointer-events-none relative z-10 -mt-[9vw] select-none whitespace-nowrap text-center text-[11.1vw] leading-none text-bone mix-blend-difference [--wght:200] lg:absolute lg:inset-x-0 lg:top-[45%] lg:mt-0"
      >
        <span className="sr-only">Antumbra — an eclipse atelier making couture headwear by hand</span>
        <span aria-hidden="true" className="inline-block overflow-hidden px-[1vw] pb-[0.06em]">
          {WORD.map((ch, i) => (
            <span key={i} data-letter className="inline-block will-change-transform [--wdth:150]" style={{ fontVariationSettings: '"wdth" var(--wdth, 150)' }}>
              {ch}
            </span>
          ))}
        </span>
      </h1>

      {/* ── upper-left label ───────────────────────────── */}
      <div data-hero-out className="relative z-10 order-first px-[var(--gutter)] lg:absolute lg:left-0 lg:top-[calc(var(--nav-h)+2.2rem)]">
        <p data-hero-fade className="label hidden max-w-[16rem] text-mist lg:block">
          Eclipse atelier — Lisbon
          <br />
          <span className="text-smoke">Couture headwear, hand-built in editions of nine</span>
        </p>
      </div>

      {/* ── statement + CTAs ───────────────────────────── */}
      <div
        data-hero-out
        className="relative z-10 mt-8 px-[var(--gutter)] lg:absolute lg:bottom-[clamp(2rem,6vh,4.5rem)] lg:left-0 lg:mt-0 lg:w-[34%]"
      >
        <p data-hero-fade className="serif-i max-w-[20ch] text-[clamp(2rem,3.3vw,3.3rem)] leading-[1.02] text-bone">
          Crowns for the hour the light goes out.
        </p>
        <div data-hero-fade className="mt-7 flex flex-wrap items-center gap-3">
          <Magnetic>
            <ButtonLink href="#collection" icon="arrowRight" data-cursor="·">
              Enter the collection
            </ButtonLink>
          </Magnetic>
          <Magnetic>
            <ButtonLink href="#fittings" variant="outline" data-cursor="·">
              Book a fitting
            </ButtonLink>
          </Magnetic>
        </div>
      </div>

      {/* ── right meta ───────────────────────────── */}
      <div
        data-hero-out
        className="relative z-10 mt-10 flex flex-col items-start gap-5 px-[var(--gutter)] lg:absolute lg:bottom-[clamp(2rem,6vh,4.5rem)] lg:right-0 lg:mt-0 lg:items-end"
      >
        <dl data-hero-fade className="label grid grid-cols-[auto_auto] gap-x-6 gap-y-1.5 text-mist lg:text-right">
          <dt className="text-smoke">Collection</dt>
          <dd>Nº 07 — Totality</dd>
          <dt className="text-smoke">Pieces</dt>
          <dd>08 · Nine of each</dd>
          <dt className="text-smoke">Season</dt>
          <dd>None, ever</dd>
        </dl>
        <p data-hero-fade className="label flex items-center gap-2 text-smoke">
          <span className="relative block size-2.5 rounded-full bg-bone/80 shadow-[0_0_12px_3px_rgba(239,236,229,.45)]" aria-hidden="true" />
          <span className="hidden [@media(pointer:fine)]:inline">Move to cast light</span>
          <span className="[@media(pointer:fine)]:hidden">Drag to cast light</span>
        </p>
      </div>

      {/* ── scroll cue ───────────────────────────── */}
      <div data-hero-out className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
        <span data-hero-fade className="label text-smoke">
          Scroll to eclipse
        </span>
        <span data-hero-fade className="relative block h-10 w-px overflow-hidden bg-bone/15" aria-hidden="true">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_2.2s_var(--ease-eclipse)_infinite] bg-bone" />
        </span>
      </div>
    </section>
  );
}
