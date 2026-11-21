"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { NAV_LINKS } from "@/lib/data";
import { useShop } from "@/components/providers/ShopProvider";
import { Clock } from "@/components/ui/Clock";

export function Nav() {
  const { count, openBag, openMenu, panel } = useShop();
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    let hidden = false;
    const set = (h: boolean) => {
      if (h === hidden) return;
      hidden = h;
      gsap.to(el, { yPercent: h ? -110 : 0, duration: 0.7, ease: "power3.out", overwrite: "auto" });
    };
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        if (self.scroll() < 160) set(false);
        else set(self.direction === 1);
      },
    });
    const onFocus = () => set(false);
    el.addEventListener("focusin", onFocus);
    return () => {
      st.kill();
      el.removeEventListener("focusin", onFocus);
    };
  });

  return (
    <header ref={ref} className="fixed inset-x-0 top-0 z-50 text-bone mix-blend-difference" data-nav>
      <div className="flex h-[var(--nav-h)] items-center justify-between gap-6 px-[var(--gutter)]" data-nav-inner>
        <a href="#top" className="flex items-center gap-3" aria-label="Antumbra — back to top" data-cursor="·">
          <span className="mark" aria-hidden="true" />
          <span className="display text-[0.95rem] tracking-[0.04em] [--wght:420]">Antumbra</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="label group relative py-2">
              <span className="mr-1.5 text-[0.55rem] text-mist/70 align-top">{l.n}</span>
              {l.label}
              <span className="absolute inset-x-0 bottom-1 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-eclipse)] group-hover:origin-left group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-6">
          <Clock className="label hidden text-mist sm:inline" />
          <button
            type="button"
            onClick={openBag}
            className="label flex items-center gap-2 py-2"
            aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
            aria-haspopup="dialog"
            aria-expanded={panel === "bag"}
            aria-controls="bag-drawer"
          >
            Bag
            <span className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.6rem] tabular-nums ring-1 ring-current" aria-hidden="true">
              {count}
            </span>
          </button>
          <button
            type="button"
            onClick={openMenu}
            className="label group flex items-center gap-3 py-2"
            aria-haspopup="dialog"
            aria-expanded={panel === "menu"}
            aria-controls="menu-overlay"
          >
            <span className="hidden xs:inline">Menu</span>
            <span className="relative block h-2.5 w-7" aria-hidden="true">
              <span className="absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-eclipse)] group-hover:scale-x-75 origin-left" />
              <span className="absolute bottom-0 right-0 h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-eclipse)] group-hover:scale-x-50 origin-right" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
