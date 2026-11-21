"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ANATOMY } from "@/lib/data";
import { Picture } from "@/components/ui/Picture";
import { SplitWords } from "@/components/ui/SplitWords";
import { scrollToTarget } from "@/components/providers/SmoothScroll";

export function Anatomy() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const stRef = useRef<ScrollTrigger | null>(null);
  const n = ANATOMY.length;

  useGSAP(
    () => {
      gsap.from("#anatomy-title .split-inner", {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.07,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 65%" },
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        let last = 0;
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: `+=${n * 65}%`,
          pin: true,
          scrub: true,
          snap: { snapTo: 1 / (n - 1), duration: { min: 0.25, max: 0.6 }, delay: 0.05, ease: "power2.inOut" },
          onUpdate(self) {
            const i = Math.round(self.progress * (n - 1));
            if (i !== last) {
              last = i;
              setActive(i);
            }
          },
        });
        stRef.current = st;
        gsap.fromTo(".anat-img", { scale: 1.02 }, { scale: 1.1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: `+=${n * 65}%`, scrub: true } });
        return () => {
          stRef.current = null;
        };
      });
    },
    { scope: root },
  );

  // clicking a point while pinned scrolls to its step so scroll and state never disagree
  const select = (i: number) => {
    setActive(i);
    const st = stRef.current;
    if (st) {
      const y = st.start + ((st.end - st.start) * i) / (n - 1);
      scrollToTarget(Math.round(y) + 1);
    }
  };

  const point = ANATOMY[active];

  return (
    <section
      ref={root}
      id="anatomy"
      aria-labelledby="anatomy-title"
      className="relative bg-coal px-[var(--gutter)] pb-20 pt-[calc(var(--nav-h)+3rem)] text-bone lg:h-[100svh] lg:pb-0"
    >
      <div className="grid h-full grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        {/* the piece */}
        <div className="relative lg:col-span-6 lg:flex lg:items-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[34rem] lg:h-[min(76svh,46rem)] lg:w-auto lg:max-w-none">
            <Picture
              slug="anatomy"
              alt="The Corona crown on a black plaster head: a fan of fine black filaments around an obsidian disc, with a leather inner band and rivets."
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="absolute inset-0"
              imgClassName="anat-img"
              position="50% 50%"
            />
            {/* leader lines run from each point out to the caption column */}
            {ANATOMY.map((a, i) => (
              <span
                key={`line-${a.title}`}
                aria-hidden="true"
                className={`pointer-events-none absolute hidden h-px origin-left bg-bone/70 transition-transform duration-700 ease-[var(--ease-eclipse)] lg:block ${
                  i === active ? "scale-x-100" : "scale-x-0"
                }`}
                style={{ left: `${a.x}%`, top: `${a.y}%`, width: `calc(${100 - a.x}% + 6vw)` }}
              />
            ))}
            {ANATOMY.map((a, i) => {
              const on = i === active;
              return (
                <div key={a.title} className="absolute" style={{ left: `${a.x}%`, top: `${a.y}%` }}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-label={`Detail ${i + 1}: ${a.title}`}
                    aria-pressed={on}
                    data-cursor="·"
                    className={`label relative -ml-4 -mt-4 grid size-8 place-items-center rounded-full text-[0.6rem] backdrop-blur-sm transition-all duration-500 ${
                      on ? "bg-bone text-ink" : "bg-ink/40 text-bone ring-1 ring-bone/50 hover:ring-bone"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                    {on ? <span aria-hidden="true" className="absolute -inset-2 animate-ping rounded-full ring-1 ring-bone/50 [animation-duration:2.4s]" /> : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* the reading */}
        <div className="flex flex-col justify-between gap-10 lg:col-span-5 lg:col-start-8 lg:py-[6vh]">
          <div>
            <p className="label mb-6 text-mist">
              <span className="text-smoke">§ 03 —</span> Signature piece
            </p>
            <SplitWords as="h2" id="anatomy-title" text="Anatomy of a Corona" className="display text-[clamp(2.6rem,5vw,5.4rem)] [--wght:220]" />
          </div>

          <div aria-live="polite">
            <p className="display flex items-baseline gap-2 text-[clamp(3.5rem,7vw,7rem)] tabular-nums text-bone [--wght:180] [--wdth:100]">
              {String(active + 1).padStart(2, "0")}
              <span className="label text-smoke">/ {String(n).padStart(2, "0")}</span>
            </p>
            <p className="display mt-4 text-2xl [--wght:340]">{point.title}</p>
            <p className="mt-3 max-w-md leading-relaxed text-mist">{point.body}</p>
          </div>

          <ol className="grid grid-cols-5 gap-2" aria-label="Details">
            {ANATOMY.map((a, i) => (
              <li key={a.title}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  className={`group w-full text-left transition-colors ${i === active ? "text-bone" : "text-smoke hover:text-mist"}`}
                >
                  <span className="block h-px w-full overflow-hidden bg-bone/15">
                    <span className={`block h-full origin-left bg-bone transition-transform duration-700 ${i <= active ? "scale-x-100" : "scale-x-0"}`} />
                  </span>
                  <span className="label mt-3 block truncate">{a.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
