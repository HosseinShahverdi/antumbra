"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CAMPAIGN } from "@/lib/data";
import { Picture } from "@/components/ui/Picture";

/**
 * Night Nº 07 — the campaign as a film in four contacts. Each frame opens
 * through a circular aperture (the eclipse, reversed) as you scroll.
 * Reduced motion: the frames simply stack.
 */
export function Night() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const frames = gsap.utils.toArray<HTMLElement>("[data-frame]");
        const captions = gsap.utils.toArray<HTMLElement>("[data-caption]");
        const ticks = gsap.utils.toArray<HTMLElement>("[data-tick]");
        const clock = root.current?.querySelector<HTMLElement>("[data-clock]");
        const n = frames.length;

        gsap.set(frames.slice(1), { clipPath: (i: number) => `circle(0% at ${CAMPAIGN[i + 1].origin})` });
        gsap.set(captions.slice(1), { autoAlpha: 0, y: 30 });
        gsap.set(ticks, { scaleX: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${n * 100}%`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        frames.forEach((frame, i) => {
          const img = frame.querySelector("img");
          tl.to(ticks[i], { scaleX: 1, duration: 1 }, i);
          tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.4 }, Math.max(0, i - 0.4));
          if (i === 0) return;
          tl.to(frame, { clipPath: `circle(75% at ${CAMPAIGN[i].origin})`, duration: 0.6, ease: "power2.inOut" }, i - 0.35)
            .to(captions[i - 1], { autoAlpha: 0, y: -30, duration: 0.25 }, i - 0.35)
            .to(captions[i], { autoAlpha: 1, y: 0, duration: 0.3 }, i - 0.1);
        });
        tl.to({}, { duration: 0.4 });

        // the timecode follows the scroll between first and third contact
        const times = CAMPAIGN.map((c) => {
          const [h, m, s] = c.time.split(":").map(Number);
          return h * 3600 + m * 60 + s;
        });
        tl.eventCallback("onUpdate", () => {
          if (!clock) return;
          const p = tl.progress() * (n - 1 + 0.4);
          const i = Math.min(n - 2, Math.floor(p));
          const f = Math.min(1, Math.max(0, p - i));
          const sec = Math.round(times[i] + (times[i + 1] - times[i]) * f);
          clock.textContent = [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map((v) => String(v).padStart(2, "0")).join(":");
        });
      });

      gsap.from("[data-night-head]", { y: 24, autoAlpha: 0, duration: 1.2, stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 70%" } });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="night" aria-labelledby="night-title" className="relative bg-ink text-bone">
      <div data-night-stage className="relative min-h-[100svh] motion-safe:h-[100svh] motion-safe:overflow-hidden">
        {/* frames */}
        <div className="motion-safe:absolute motion-safe:inset-0">
          {CAMPAIGN.map((c, i) => (
            <figure
              key={c.title}
              data-frame
              className={`relative h-[100svh] w-full motion-safe:absolute motion-safe:inset-0 ${i > 0 ? "night-later" : ""}`}
              style={{ zIndex: i, ["--origin" as string]: c.origin }}
            >
              <Picture
                slug={c.image}
                alt={c.alt}
                sizes="100vw"
                className="absolute inset-0"
                position={c.image === "contact-hands" ? "50% 40%" : "50% 50%"}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-ink/40" />
              {/* caption for the stacked (reduced-motion) layout */}
              <figcaption className="absolute bottom-10 left-[var(--gutter)] max-w-md motion-safe:hidden">
                <p className="label text-mist">
                  {c.numeral} · {c.title} · {c.time}
                </p>
                <p className="serif-i mt-3 text-3xl leading-tight">{c.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* overlay UI */}
        <div className="pointer-events-none absolute inset-0 z-10 hidden flex-col justify-between px-[var(--gutter)] pb-[clamp(1.5rem,5vh,3rem)] pt-[calc(var(--nav-h)+1.5rem)] motion-safe:flex">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p data-night-head className="label text-mist">
                <span className="text-smoke">§ 06 —</span> Campaign
              </p>
              <h2 id="night-title" data-night-head className="display mt-3 text-[clamp(2.2rem,4.6vw,4.6rem)] [--wght:220]">
                Night Nº 07
              </h2>
              <p data-night-head className="serif-i mt-2 text-xl text-mist">A film in four contacts</p>
            </div>
            <p data-night-head className="label text-right text-mist">
              <span className="block text-smoke">Timecode</span>
              <span data-clock className="font-mono text-lg tabular-nums text-bone">
                {CAMPAIGN[0].time}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-12">
            <div className="relative min-h-[9rem] md:col-span-6">
              {CAMPAIGN.map((c, i) => (
                <div key={c.title} data-caption className={`absolute inset-x-0 bottom-0 ${i > 0 ? "opacity-0" : ""}`}>
                  <p className="label text-mist">
                    Contact {c.numeral} — {c.title}
                  </p>
                  <p className="serif-i mt-3 max-w-[24ch] text-[clamp(1.7rem,2.8vw,2.8rem)] leading-[1.05]">{c.caption}</p>
                </div>
              ))}
            </div>
            <ol className="grid grid-cols-4 gap-2 md:col-span-5 md:col-start-8" aria-label="Contacts">
              {CAMPAIGN.map((c) => (
                <li key={c.title}>
                  <span className="block h-px bg-bone/20">
                    <span data-tick className="block h-full origin-left bg-bone" />
                  </span>
                  <span className="label mt-3 block text-[0.6rem] text-mist">{c.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
