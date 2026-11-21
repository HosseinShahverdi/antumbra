"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EDITION, FAMILIES, PRODUCTS, formatPrice, type Family } from "@/lib/data";
import { useShop } from "@/components/providers/ShopProvider";
import { Picture } from "@/components/ui/Picture";
import { SplitWords } from "@/components/ui/SplitWords";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function Collection() {
  const { openProduct } = useShop();
  const [filter, setFilter] = useState<"All" | Family>("All");
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  const items = PRODUCTS.filter((p) => filter === "All" || p.family === filter);

  // heading reveal (independent of filtering)
  useGSAP(
    () => {
      gsap.from("#collection-title .split-inner", {
        yPercent: 110,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: root.current, start: "top 72%" },
      });
    },
    { scope: root },
  );

  // horizontal, pinned gallery on large screens; native swipe carousel elsewhere
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const vp = viewport.current;
        const tr = track.current;
        const section = root.current;
        if (!vp || !tr || !section) return;
        vp.style.overflowX = "clip";
        const distance = () => Math.max(0, tr.scrollWidth - vp.clientWidth);
        const tween = gsap.to(tr, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.utils.toArray<HTMLElement>(".card-img", tr).forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -7, scale: 1.16 },
            {
              xPercent: 7,
              scale: 1.16,
              ease: "none",
              scrollTrigger: { trigger: img.closest("li"), containerAnimation: tween, start: "left right", end: "right left", scrub: true },
            },
          );
        });
        gsap.fromTo(
          "[data-coll-progress]",
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, scrub: true } },
        );
        return () => {
          vp.style.overflowX = "";
        };
      });
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  );

  const nudge = (dir: 1 | -1) => {
    const vp = viewport.current;
    if (!vp) return;
    vp.scrollBy({ left: dir * vp.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <section
      ref={root}
      id="collection"
      aria-labelledby="collection-title"
      className="relative overflow-hidden bg-paper pb-14 pt-[calc(var(--nav-h)+3rem)] text-ink lg:h-[100svh] lg:pb-0 lg:pt-0"
    >
      <div ref={viewport} className="no-scrollbar h-full snap-x snap-mandatory scroll-px-[var(--gutter)] overflow-x-auto overscroll-x-contain lg:snap-none">
        <ul ref={track} className="flex h-full w-max items-stretch gap-[clamp(1.25rem,3vw,3.5rem)] px-[var(--gutter)] lg:pr-[8vw]">
          {/* intro panel */}
          <li className="flex w-[calc(100vw-2*var(--gutter))] shrink-0 snap-start flex-col justify-start gap-10 lg:w-[54vw] lg:justify-between lg:pb-[7vh] lg:pt-[calc(var(--nav-h)+5vh)]">
            <div>
              <p className="label mb-6 text-iron">
                <span className="text-smoke">§ 02 —</span> Collection Nº 07
              </p>
              <SplitWords
                as="h2"
                text="Totality"
                className="display text-[10.4vw] [--wght:210] lg:text-[6.1vw]"
                id="collection-title"
              />
              <p className="serif-i mt-6 max-w-[24ch] text-[clamp(1.5rem,2.2vw,2.2rem)] leading-[1.08]">
                Eight pieces. Nine of each. Made to be worn once the lights are off.
              </p>
            </div>

            <div>
              <div role="group" aria-label="Filter pieces by family" className="flex flex-wrap gap-2">
                {FAMILIES.map((f) => {
                  const n = f === "All" ? PRODUCTS.length : PRODUCTS.filter((p) => p.family === f).length;
                  const active = filter === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(f)}
                      className={`label flex h-9 items-center gap-2 rounded-full px-4 ring-1 ring-inset transition-colors duration-300 ${
                        active ? "bg-ink text-bone ring-ink" : "ring-ink/25 hover:ring-ink"
                      }`}
                    >
                      {f}
                      <span className={`tabular-nums ${active ? "text-mist" : "text-smoke"}`}>{String(n).padStart(2, "0")}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-between gap-4 lg:hidden">
                <p className="label text-iron">Swipe the collection</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => nudge(-1)} aria-label="Previous pieces" className="grid size-10 place-items-center rounded-full ring-1 ring-ink/25">
                    <Icon name="arrowLeft" size={18} />
                  </button>
                  <button type="button" onClick={() => nudge(1)} aria-label="Next pieces" className="grid size-10 place-items-center rounded-full ring-1 ring-ink/25">
                    <Icon name="arrowRight" size={18} />
                  </button>
                </div>
              </div>
              <p className="label mt-8 hidden text-iron lg:block">Scroll to walk the collection →</p>
            </div>
          </li>

          {items.map((p, i) => {
            const tall = i % 2 === 1;
            return (
              <li
                key={p.id}
                className={`shrink-0 snap-start ${tall ? "lg:mb-[6vh] lg:self-end" : "lg:mt-[calc(var(--nav-h)+9vh)] lg:self-start"}`}
              >
                <button
                  type="button"
                  onClick={() => openProduct(p.id)}
                  data-cursor="View"
                  aria-label={`${p.name}, ${formatPrice(p.price)}, ${p.remaining} of ${EDITION} remain — view piece`}
                  className="group block w-[72vw] text-left sm:w-[42vw] lg:w-auto"
                >
                  <span className="label mb-3 flex justify-between text-iron">
                    <span>Nº {p.index}</span>
                    <span>{p.family}</span>
                  </span>
                  <span className={`relative block aspect-[3/4] overflow-hidden ${tall ? "lg:h-[60vh]" : "lg:h-[52vh]"} lg:aspect-[3/4]`}>
                    <Picture
                      slug={p.image}
                      alt={p.alt}
                      sizes="(min-width: 1024px) 45vh, (min-width: 640px) 42vw, 72vw"
                      className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
                      imgClassName="card-img saturate-0 transition-[filter] duration-700 group-hover:brightness-[1.08]"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100" />
                    <span className="serif-i pointer-events-none absolute inset-x-5 bottom-5 translate-y-3 text-xl leading-tight text-bone opacity-0 transition-all duration-700 ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      {p.line}
                    </span>
                  </span>
                  <span className="mt-4 flex items-start justify-between gap-4">
                    <span className="display text-[clamp(1.35rem,1.8vw,1.75rem)] [--wght:300]">{p.name}</span>
                    <span className="font-mono text-sm tabular-nums">{formatPrice(p.price)}</span>
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="flex gap-1" aria-hidden="true">
                      {Array.from({ length: EDITION }).map((_, d) => (
                        <span key={d} className={`size-1.5 rounded-full ${d < EDITION - p.remaining ? "bg-ink/15" : "bg-ink"}`} />
                      ))}
                    </span>
                    <span className="label text-iron">{p.remaining === 1 ? "Last of nine" : `${p.remaining} of 9 remain`}</span>
                  </span>
                </button>
              </li>
            );
          })}

          {/* outro panel */}
          <li className="flex w-[72vw] shrink-0 snap-start flex-col justify-center gap-8 sm:w-[42vw] lg:w-[30vw]">
            <span className="mark text-ink [--mark:3.5rem]" aria-hidden="true" />
            <p className="serif-i max-w-[16ch] text-[clamp(1.8rem,2.6vw,2.6rem)] leading-[1.05]">Nothing leaves the atelier before it has been fitted.</p>
            <div>
              <ButtonLink href="#fittings" variant="dark" icon="arrowRight">
                Book a fitting
              </ButtonLink>
            </div>
          </li>
        </ul>
      </div>

      <div aria-hidden="true" className="absolute inset-x-[var(--gutter)] bottom-6 hidden h-px bg-ink/15 lg:block">
        <div data-coll-progress className="h-full origin-left scale-x-0 bg-ink" />
      </div>
    </section>
  );
}
