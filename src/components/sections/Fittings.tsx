"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PRODUCTS } from "@/lib/data";
import { useShop } from "@/components/providers/ShopProvider";
import { Picture } from "@/components/ui/Picture";
import { SplitWords } from "@/components/ui/SplitWords";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Errors = Partial<Record<"name" | "email" | "place" | "consent", string>>;

const PLACES = [
  { id: "lisbon", label: "Lisbon atelier", icon: "pin" as const },
  { id: "paris", label: "Paris salon", icon: "pin" as const },
  { id: "video", label: "Over video", icon: "video" as const },
];

const WHEN = ["As soon as possible", "Within a month", "Within three months", "No hurry — whenever it is dark"];

export function Fittings() {
  const root = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { lines } = useShop();
  const uid = useId();
  const [pieces, setPieces] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [ref, setRef] = useState("");

  // pieces already in the bag arrive pre-selected
  useEffect(() => {
    const fromBag = Array.from(new Set(lines.map((l) => l.productId)));
    if (fromBag.length === 0) return;
    const t = window.setTimeout(() => setPieces((prev) => Array.from(new Set([...prev, ...fromBag]))), 0);
    return () => window.clearTimeout(t);
  }, [lines]);

  useGSAP(
    () => {
      gsap.from("#fittings-title .split-inner", {
        yPercent: 110,
        duration: 1.5,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });
      // the light returns
      gsap.fromTo(
        ".closing-img",
        { filter: "brightness(0.35)", scale: 1.08 },
        { filter: "brightness(1)", scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } },
      );
      gsap.from("[data-fit-fade]", { y: 24, autoAlpha: 0, duration: 1.2, stagger: 0.07, scrollTrigger: { trigger: root.current, start: "top 50%" } });
    },
    { scope: root },
  );

  const validate = (fd: FormData): Errors => {
    const e: Errors = {};
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    if (name.length < 2) e.name = "Tell us what to call you.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "That address doesn’t look complete.";
    if (!fd.get("place")) e.place = "Choose where we should meet.";
    if (!fd.get("consent")) e.consent = "We need your permission to write back.";
    return e;
  };

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const e = validate(fd);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    // Frontend concept: no request leaves the browser. We simulate the round trip.
    window.setTimeout(() => {
      setRef(`AN-07-${Math.floor(1000 + Math.random() * 9000)}`);
      setStatus("sent");
    }, 1400);
  };

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="mt-2 flex items-center gap-1.5 text-sm text-[#e0a29a]">
        <Icon name="danger" size={15} /> {errors[k]}
      </p>
    ) : null;

  return (
    <section ref={root} id="fittings" aria-labelledby="fittings-title" className="relative isolate overflow-hidden bg-ink text-bone">
      <div className="relative h-[58svh] lg:absolute lg:inset-0 lg:h-auto">
        <Picture
          slug="closing"
          alt="A model in profile, face almost entirely in darkness, a thin crescent of light along the brow and lips."
          sizes="100vw"
          className="absolute inset-0 -z-10"
          imgClassName="closing-img"
          position="22% 40%"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink lg:bg-gradient-to-r lg:from-transparent lg:via-ink/10 lg:to-ink/90" />
      </div>

      <div className="relative grid grid-cols-1 px-[var(--gutter)] pb-24 lg:min-h-[100svh] lg:grid-cols-12 lg:py-[calc(var(--nav-h)+4rem)]">
        <div className="lg:col-span-6 lg:col-start-7">
          <p data-fit-fade className="label mb-6 text-mist">
            <span className="text-smoke">§ 07 —</span> Fittings
          </p>
          <SplitWords as="h2" id="fittings-title" text="Arrive once the room is dark." className="display text-[clamp(2.6rem,5.4vw,5.6rem)] [--wght:210]" />
          <p data-fit-fade className="mt-6 max-w-md leading-relaxed text-mist">
            Every crown is fitted before it is yours — at the bench in Lisbon, in a borrowed salon in Paris, or over video with a box of
            plaster tools sent ahead. Tell us when, and we will write back within two nights.
          </p>

          {status === "sent" ? (
            <div data-fit-fade className="mt-12 border-t border-bone/15 pt-10" role="status">
              <Icon name="check" size={28} />
              <p className="serif-i mt-5 text-4xl leading-tight">Your request is held.</p>
              <p className="mt-4 max-w-md text-mist">
                Reference <span className="font-mono text-bone">{ref}</span>. This is a concept site, so nothing was sent — but in the real atelier, this
                is where we would write back within two nights.
              </p>
              <Button
                variant="outline"
                icon="arrowRight"
                className="mt-8"
                onClick={() => {
                  setStatus("idle");
                  setErrors({});
                }}
              >
                Request another
              </Button>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} className="mt-12 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2" aria-describedby={`${uid}-disclaimer`}>
              <div data-fit-fade>
                <label htmlFor={`${uid}-name`} className="label text-smoke">
                  Name
                </label>
                <input
                  id={`${uid}-name`}
                  name="name"
                  autoComplete="name"
                  className="field"
                  placeholder="How should we address you"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                />
                {err("name")}
              </div>
              <div data-fit-fade>
                <label htmlFor={`${uid}-email`} className="label text-smoke">
                  Email
                </label>
                <input
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className="field"
                  placeholder="you@domain"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? `${uid}-email-err` : undefined}
                />
                {err("email")}
              </div>

              <fieldset data-fit-fade className="sm:col-span-2" aria-describedby={errors.place ? `${uid}-place-err` : undefined}>
                <legend className="label mb-3 text-smoke">Where</legend>
                <div className="flex flex-wrap gap-2">
                  {PLACES.map((p) => (
                    <label key={p.id} className="cursor-pointer">
                      <input type="radio" name="place" value={p.id} className="peer sr-only" />
                      <span className="label flex h-11 items-center gap-2 rounded-full px-5 ring-1 ring-inset ring-bone/25 transition-colors hover:ring-bone peer-checked:bg-bone peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-bone">
                        <Icon name={p.icon} size={16} /> {p.label}
                      </span>
                    </label>
                  ))}
                </div>
                {err("place")}
              </fieldset>

              <div data-fit-fade>
                <label htmlFor={`${uid}-when`} className="label text-smoke">
                  When
                </label>
                <div className="relative">
                  <select id={`${uid}-when`} name="when" className="field pr-8" defaultValue={WHEN[1]}>
                    {WHEN.map((w) => (
                      <option key={w}>{w}</option>
                    ))}
                  </select>
                  <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-mist" />
                </div>
              </div>

              <fieldset data-fit-fade className="sm:col-span-2">
                <legend className="label mb-3 text-smoke">Pieces to try {pieces.length ? `(${pieces.length})` : "(optional)"}</legend>
                <div className="flex flex-wrap gap-2">
                  {PRODUCTS.map((p) => {
                    const on = pieces.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setPieces((prev) => (on ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                        className={`label h-9 rounded-full px-4 ring-1 ring-inset transition-colors ${on ? "bg-bone text-ink ring-bone" : "ring-bone/20 text-mist hover:ring-bone"}`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" name="pieces" value={pieces.join(",")} />
              </fieldset>

              <div data-fit-fade className="sm:col-span-2">
                <label htmlFor={`${uid}-note`} className="label text-smoke">
                  Anything we should know
                </label>
                <textarea id={`${uid}-note`} name="note" rows={3} className="field resize-none" placeholder="An occasion, a date, a head that is hard to fit…" />
              </div>

              <div data-fit-fade className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-mist">
                  <input
                    type="checkbox"
                    name="consent"
                    className="mt-0.5 size-4 shrink-0 accent-bone"
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
                  />
                  You may write to me about this fitting. Nothing else, ever.
                </label>
                {err("consent")}
              </div>

              <div data-fit-fade className="flex flex-wrap items-center gap-5 sm:col-span-2">
                <Button type="submit" icon="arrowRight" disabled={status === "sending"} aria-busy={status === "sending"}>
                  {status === "sending" ? "Holding your date…" : "Request a fitting"}
                </Button>
                <p id={`${uid}-disclaimer`} className="label text-smoke">
                  Concept site — nothing is sent.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
