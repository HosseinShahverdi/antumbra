"use client";

import { useRef } from "react";
import { useShop } from "@/components/providers/ShopProvider";
import { useDialog } from "@/components/ui/useDialog";
import { Picture } from "@/components/ui/Picture";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { FINISHES, PRODUCTS, SIZES, formatPrice } from "@/lib/data";
import { scrollToTarget } from "@/components/providers/SmoothScroll";

export function BagDrawer() {
  const { panel, close, lines, setQty, remove, subtotal, count } = useShop();
  const open = panel === "bag";
  const ref = useRef<HTMLDivElement>(null);
  useDialog(open, ref, close);

  const toFittings = () => {
    close();
    window.setTimeout(() => scrollToTarget("#fittings"), 420);
  };

  return (
    <div className={`fixed inset-0 z-[85] ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <button
        type="button"
        aria-label="Close bag"
        tabIndex={-1}
        onClick={close}
        className={`absolute inset-0 bg-ink/60 backdrop-blur-[2px] transition-opacity duration-700 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={ref}
        id="bag-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[30rem] flex-col bg-bone text-ink transition-transform duration-[900ms] ease-[var(--ease-eclipse)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 id="bag-title" className="display text-2xl [--wght:300]">
            Bag <span className="align-top text-sm tabular-nums">({count})</span>
          </h2>
          <button type="button" onClick={close} className="label flex items-center gap-2 py-2">
            Close <Icon name="close" size={18} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6">
            <span className="mark [--mark:3rem] text-ink/80" aria-hidden="true" />
            <p className="serif-i max-w-xs text-3xl leading-tight">Empty — like the sky at totality.</p>
            <Button
              variant="dark"
              icon="arrowRight"
              onClick={() => {
                close();
                window.setTimeout(() => scrollToTarget("#collection"), 420);
              }}
            >
              Browse the collection
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6" data-lenis-prevent>
              {lines.map((l) => {
                const p = PRODUCTS.find((x) => x.id === l.productId);
                if (!p) return null;
                const size = SIZES.find((s) => s.id === l.size)?.label;
                const finish = FINISHES.find((f) => f.id === l.finish)?.label;
                return (
                  <li key={l.key} className="flex gap-4 py-5">
                    <Picture slug={p.image} alt={p.alt} sizes="80px" className="h-[6.5rem] w-20 shrink-0" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="display text-lg [--wght:340]">{p.name}</p>
                          <p className="label mt-1 text-iron">
                            {size} · {finish}
                          </p>
                        </div>
                        <p className="font-mono text-sm tabular-nums">{formatPrice(p.price * l.qty)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2" role="group" aria-label={`Quantity of ${p.name}`}>
                          <button
                            type="button"
                            onClick={() => setQty(l.key, l.qty - 1)}
                            disabled={l.qty <= 1}
                            className="grid size-8 place-items-center rounded-full transition-colors hover:bg-ink/5 disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Icon name="minus" size={18} />
                          </button>
                          <span className="w-5 text-center font-mono text-sm tabular-nums" aria-live="polite">
                            {l.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(l.key, l.qty + 1)}
                            disabled={l.qty >= 3}
                            className="grid size-8 place-items-center rounded-full transition-colors hover:bg-ink/5 disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Icon name="plus" size={18} />
                          </button>
                        </div>
                        <button type="button" onClick={() => remove(l.key)} className="label flex items-center gap-1.5 text-iron hover:text-ink">
                          <Icon name="trash" size={15} /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-4 border-t border-ink/10 px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span className="label">Subtotal</span>
                <span className="font-mono text-lg tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-sm leading-relaxed text-iron">
                Nothing is charged online. Every piece is fitted first — in Lisbon, Paris or over video — and payment is taken only once it fits.
              </p>
              <Button variant="dark" icon="arrowRight" className="w-full" onClick={toFittings}>
                Request a fitting
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
