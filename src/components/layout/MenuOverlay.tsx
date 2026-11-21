"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { NAV_LINKS } from "@/lib/data";
import { Countdown } from "@/components/ui/Countdown";
import { useShop } from "@/components/providers/ShopProvider";
import { useDialog } from "@/components/ui/useDialog";
import { Picture } from "@/components/ui/Picture";
import { Clock } from "@/components/ui/Clock";
import { Icon } from "@/components/ui/Icon";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import type { ImageSlug } from "@/lib/images.generated";

const PREVIEW: Record<string, ImageSlug> = {
  "#collection": "corona",
  "#anatomy": "anatomy",
  "#instrument": "hero",
  "#night": "totality",
  "#fittings": "closing",
};

export function MenuOverlay() {
  const { panel, close } = useShop();
  const open = panel === "menu";
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string>("#collection");
  useDialog(open, ref, close);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const reduced = prefersReducedMotion();
      if (open) {
        gsap.set(el, { visibility: "visible" });
        gsap.fromTo(
          el,
          { clipPath: "circle(0% at calc(100% - 3.5rem) 2.1rem)" },
          { clipPath: "circle(150% at calc(100% - 3.5rem) 2.1rem)", duration: reduced ? 0 : 1.1, ease: "expo.inOut" },
        );
        gsap.fromTo(
          el.querySelectorAll("[data-menu-item]"),
          { yPercent: reduced ? 0 : 110 },
          { yPercent: 0, duration: reduced ? 0 : 1, stagger: 0.06, delay: reduced ? 0 : 0.35, ease: "expo.out" },
        );
      } else {
        gsap.to(el, {
          clipPath: "circle(0% at calc(100% - 3.5rem) 2.1rem)",
          duration: reduced ? 0 : 0.8,
          ease: "expo.inOut",
          onComplete: () => {
            gsap.set(el, { visibility: "hidden" });
          },
        });
      }
    },
    { dependencies: [open], scope: ref },
  );

  const go = (href: string) => {
    close();
    window.setTimeout(() => scrollToTarget(href), 380);
  };

  return (
    <div
      ref={ref}
      id="menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className="invisible fixed inset-0 z-[80] flex flex-col bg-ink text-bone"
      style={{ clipPath: "circle(0% at calc(100% - 3.5rem) 2.1rem)" }}
    >
      <div className="flex h-[var(--nav-h)] items-center justify-between px-[var(--gutter)]">
        <span className="flex items-center gap-3">
          <span className="mark" aria-hidden="true" />
          <span className="display text-[0.95rem] tracking-[0.04em] [--wght:420]">Antumbra</span>
        </span>
        <button type="button" onClick={close} className="label flex items-center gap-2 py-2" data-autofocus>
          Close <Icon name="close" size={18} />
        </button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-10 overflow-y-auto px-[var(--gutter)] pb-8 pt-6 lg:grid-cols-12" data-lenis-prevent>
        <nav aria-label="Menu" className="lg:col-span-7 lg:self-center">
          <ul className="space-y-1 sm:space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href} className="overflow-hidden">
                <a
                  href={l.href}
                  data-menu-item
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    go(l.href);
                  }}
                  onMouseEnter={() => setHover(l.href)}
                  onFocus={() => setHover(l.href)}
                  className="menu-link group flex items-baseline gap-4 whitespace-nowrap font-display text-[clamp(2.3rem,5.6vw,6rem)] uppercase leading-[0.9] [font-weight:260]"
                  data-cursor="Go"
                >
                  <span className="label w-8 shrink-0 text-mist">{l.n}</span>
                  <span className="transition-colors duration-500 group-hover:text-mist">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden flex-col justify-between gap-8 lg:col-span-5 lg:flex">
          <div className="relative ml-auto aspect-square w-[min(28vw,26rem)]">
            {Object.entries(PREVIEW).map(([href, slug]) => (
              <Picture
                key={href}
                slug={slug}
                alt=""
                decorative
                sizes="28vw"
                className={`absolute inset-0 rounded-full transition-[opacity,transform] duration-700 ease-[var(--ease-eclipse)] ${
                  hover === href ? "scale-100 opacity-100" : "scale-[0.92] opacity-0"
                }`}
              />
            ))}
            <span className="pointer-events-none absolute -inset-3 rounded-full ring-1 ring-bone/25" aria-hidden="true" />
          </div>
          <dl className="grid grid-cols-2 gap-6 text-sm text-mist">
            <div>
              <dt className="label mb-2 text-smoke">Atelier</dt>
              <dd>Lisbon, by appointment</dd>
              <dd>
                <Clock prefix="Local" />
              </dd>
            </div>
            <div>
              <dt className="label mb-2 text-smoke">Fittings</dt>
              <dd>Lisbon · Paris · Video</dd>
              <dd>Within two nights of asking</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="label flex flex-wrap justify-between gap-3 border-t border-bone/10 px-[var(--gutter)] py-5 text-smoke">
        <span>Next totality over Iberia — 02.08.2027</span>
        <span>
          T – <Countdown /> nights
        </span>
      </div>
    </div>
  );
}
