"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { PRODUCTS, type Product } from "@/lib/data";

export type BagLine = {
  key: string;
  productId: string;
  size: string;
  finish: string;
  qty: number;
};

type Panel = "none" | "bag" | "menu" | "product";

type State = {
  lines: BagLine[];
  panel: Panel;
  productId: string | null;
  hydrated: boolean;
};

type Action =
  | { type: "hydrate"; lines: BagLine[] }
  | { type: "add"; line: Omit<BagLine, "key" | "qty">; qty: number }
  | { type: "qty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "open"; panel: Panel; productId?: string }
  | { type: "close" };

const STORAGE_KEY = "antumbra:bag:v1";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, lines: action.lines, hydrated: true };
    case "add": {
      const key = `${action.line.productId}:${action.line.size}:${action.line.finish}`;
      const existing = state.lines.find((l) => l.key === key);
      const lines = existing
        ? state.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + action.qty, 3) } : l))
        : [...state.lines, { ...action.line, key, qty: Math.min(action.qty, 3) }];
      return { ...state, lines };
    }
    case "qty":
      return {
        ...state,
        lines: state.lines.map((l) => (l.key === action.key ? { ...l, qty: Math.max(1, Math.min(action.qty, 3)) } : l)),
      };
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };
    case "open":
      return { ...state, panel: action.panel, productId: action.productId ?? state.productId };
    case "close":
      return { ...state, panel: "none" };
    default:
      return state;
  }
}

type ShopContextValue = {
  lines: BagLine[];
  count: number;
  subtotal: number;
  panel: Panel;
  product: Product | null;
  add: (line: Omit<BagLine, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  openBag: () => void;
  openMenu: () => void;
  openProduct: (id: string) => void;
  close: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], panel: "none", productId: null, hydrated: false });

  // restore the bag (per-viewer convenience only — never required for the page to work)
  useEffect(() => {
    let lines: BagLine[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BagLine[];
        if (Array.isArray(parsed)) lines = parsed.filter((l) => PRODUCTS.some((p) => p.id === l.productId));
      }
    } catch {
      /* storage unavailable */
    }
    dispatch({ type: "hydrate", lines });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      /* storage unavailable */
    }
  }, [state.lines, state.hydrated]);

  const add = useCallback((line: Omit<BagLine, "key" | "qty">, qty = 1) => dispatch({ type: "add", line, qty }), []);
  const setQty = useCallback((key: string, qty: number) => dispatch({ type: "qty", key, qty }), []);
  const remove = useCallback((key: string) => dispatch({ type: "remove", key }), []);
  const openBag = useCallback(() => dispatch({ type: "open", panel: "bag" }), []);
  const openMenu = useCallback(() => dispatch({ type: "open", panel: "menu" }), []);
  const openProduct = useCallback((id: string) => dispatch({ type: "open", panel: "product", productId: id }), []);
  const close = useCallback(() => dispatch({ type: "close" }), []);

  const value = useMemo<ShopContextValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = state.lines.reduce((n, l) => n + l.qty * (PRODUCTS.find((p) => p.id === l.productId)?.price ?? 0), 0);
    return {
      lines: state.lines,
      count,
      subtotal,
      panel: state.panel,
      product: PRODUCTS.find((p) => p.id === state.productId) ?? null,
      add,
      setQty,
      remove,
      openBag,
      openMenu,
      openProduct,
      close,
    };
  }, [state, add, setQty, remove, openBag, openMenu, openProduct, close]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}
