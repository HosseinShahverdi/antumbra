"use client";

import { useEffect, useRef, useState } from "react";
import { useShop } from "@/components/providers/ShopProvider";
import { useDialog } from "@/components/ui/useDialog";
import { Picture } from "@/components/ui/Picture";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { EDITION, FINISHES, PRODUCTS, SIZES, formatPrice } from "@/lib/data";

export function ProductDrawer() {
  const { panel, close, product, add, openBag, openProduct } = useShop();
  const open = panel === "product" && product !== null;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<string>("m");
  const [finish, setFinish] = useState<string>("blackened");
  const [added, setAdded] = useState(false);
  const [inBag, setInBag] = useState(false);
  useDialog(open, ref, close);

  // reset choices when another piece is opened
  const productId = product?.id;
  useEffect(() => {
    const t = window.setTimeout(() => {
      setSize("m");
      setFinish("blackened");
      setAdded(false);
      setInBag(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [productId]);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [added]);

  const idx = product ? PRODUCTS.findIndex((p) => p.id === product.id) : -1;
  const next = idx >= 0 ? PRODUCTS[(idx + 1) % PRODUCTS.length] : null;
  const soldOut = product ? product.remaining <= 0 : false;

  return (
    <div className={`fixed inset-0 z-[85] ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <button
        type="button"
        aria-label="Close piece"
        tabIndex={-1}
        onClick={close}
        className={`absolute inset-0 bg-ink/70 backdrop-blur-[2px] transition-opacity duration-700 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[70rem] flex-col overflow-y-auto bg-night text-bone transition-transform duration-[1000ms] ease-[var(--ease-eclipse)] lg:flex-row lg:overflow-hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        data-lenis-prevent
      >
        {product ? (
          <>
            <div className="relative h-[62svh] shrink-0 lg:h-auto lg:w-1/2">
              <Picture key={product.id} slug={product.image} alt={product.alt} sizes="(min-width: 1024px) 35rem, 100vw" className="absolute inset-0" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
              <p className="label absolute bottom-5 left-5 text-mist">
                Nº {product.index} · {product.family}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-8 p-6 sm:p-10 lg:overflow-y-auto">
              <div className="flex items-center justify-between">
                <p className="label text-smoke">Collection Nº 07 — Totality</p>
                <button type="button" onClick={close} className="label flex items-center gap-2 py-2" data-autofocus>
                  Close <Icon name="close" size={18} />
                </button>
              </div>

              <div>
                <h2 id="product-title" className="display text-[clamp(2.4rem,4.6vw,4rem)] [--wght:240]">
                  {product.name}
                </h2>
                <p className="serif-i mt-4 text-2xl text-mist">{product.line}</p>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4 border-y border-bone/10 py-5">
                <p className="font-mono text-2xl tabular-nums">{formatPrice(product.price)}</p>
                <div>
                  <p className="label mb-2 text-smoke">
                    Edition — {product.remaining} of {EDITION} remain
                  </p>
                  <div className="flex gap-1.5" aria-hidden="true">
                    {Array.from({ length: EDITION }).map((_, i) => (
                      <span
                        key={i}
                        className={`size-2.5 rounded-full ${i < EDITION - product.remaining ? "bg-bone/15" : "ring-1 ring-bone"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="max-w-prose leading-relaxed text-mist">{product.description}</p>

              <fieldset>
                <legend className="label mb-3 text-smoke">Head circumference</legend>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <label key={s.id} className="cursor-pointer">
                      <input type="radio" name="size" value={s.id} checked={size === s.id} onChange={() => setSize(s.id)} className="peer sr-only" />
                      <span className="label flex h-10 items-center rounded-full px-4 ring-1 ring-inset ring-bone/25 transition-colors peer-checked:bg-bone peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-bone hover:ring-bone">
                        {s.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="label mb-3 text-smoke">
                  Finish — <span className="text-bone">{FINISHES.find((f) => f.id === finish)?.label}</span>
                </legend>
                <div className="flex gap-3">
                  {FINISHES.map((f) => (
                    <label key={f.id} className="cursor-pointer" title={f.label}>
                      <input type="radio" name="finish" value={f.id} checked={finish === f.id} onChange={() => setFinish(f.id)} className="peer sr-only" />
                      <span className="sr-only">{f.label}</span>
                      <span
                        aria-hidden="true"
                        className="block size-9 rounded-full ring-1 ring-bone/25 ring-offset-4 ring-offset-night transition-shadow peer-checked:ring-bone peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-[6px] peer-focus-visible:outline-bone"
                        style={{ background: f.swatch }}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap gap-3">
                <Button
                  icon={added ? "check" : "bag"}
                  disabled={soldOut}
                  onClick={() => {
                    add({ productId: product.id, size, finish });
                    setAdded(true);
                    setInBag(true);
                  }}
                  aria-live="polite"
                >
                  {added ? "Added to bag" : inBag ? "Add another" : "Add to bag"}
                </Button>
                {inBag ? (
                  <Button variant="outline" icon="arrowRight" onClick={openBag}>
                    View bag
                  </Button>
                ) : null}
              </div>

              <dl className="grid grid-cols-1 gap-5 border-t border-bone/10 pt-6 text-sm sm:grid-cols-3">
                <div>
                  <dt className="label mb-2 text-smoke">Materials</dt>
                  {product.materials.map((m) => (
                    <dd key={m} className="text-mist">
                      {m}
                    </dd>
                  ))}
                </div>
                <div>
                  <dt className="label mb-2 text-smoke">Weight</dt>
                  <dd className="font-mono text-mist">{product.weight}</dd>
                </div>
                <div>
                  <dt className="label mb-2 text-smoke">At the bench</dt>
                  <dd className="font-mono text-mist">{product.hours} hours</dd>
                </div>
              </dl>

              {next ? (
                <button
                  type="button"
                  onClick={() => openProduct(next.id)}
                  className="group mt-auto flex items-center justify-between border-t border-bone/10 pt-6 text-left"
                >
                  <span>
                    <span className="label block text-smoke">Next piece</span>
                    <span className="display mt-1 block text-xl [--wght:300]">{next.name}</span>
                  </span>
                  <Icon name="arrowRight" size={22} className="transition-transform duration-500 group-hover:translate-x-1.5" />
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
