import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/icons.generated";

type Variant = "solid" | "outline" | "dark";

const base =
  "group/btn relative isolate inline-flex h-12 items-center justify-center gap-3 overflow-hidden rounded-full px-6 label whitespace-nowrap transition-colors duration-500 ease-[var(--ease-eclipse)] disabled:cursor-not-allowed disabled:opacity-40 " +
  "before:absolute before:inset-0 before:-z-10 before:rounded-full before:translate-x-[-101%] before:transition-transform before:duration-700 before:ease-[var(--ease-eclipse)] hover:before:translate-x-0 focus-visible:before:translate-x-0 disabled:before:hidden";

const variants: Record<Variant, string> = {
  solid: "bg-bone text-ink before:bg-ink hover:text-bone focus-visible:text-bone ring-1 ring-inset ring-bone",
  outline: "text-current ring-1 ring-inset ring-current/40 before:bg-bone hover:text-ink focus-visible:text-ink hover:ring-bone",
  dark: "bg-ink text-bone before:bg-bone hover:text-ink focus-visible:text-ink ring-1 ring-inset ring-ink",
};

type Common = { variant?: Variant; icon?: IconName; children: ReactNode; className?: string };

function Inner({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <>
      <span className="relative">{children}</span>
      {icon ? (
        <span className="relative grid size-5 place-items-center overflow-hidden" aria-hidden="true">
          <Icon name={icon} size={18} className="transition-transform duration-500 ease-[var(--ease-eclipse)] group-hover/btn:translate-x-[140%]" />
          <Icon
            name={icon}
            size={18}
            className="absolute -translate-x-[140%] transition-transform duration-500 ease-[var(--ease-eclipse)] group-hover/btn:translate-x-0"
          />
        </span>
      ) : null}
    </>
  );
}

export function Button({ variant = "solid", icon, children, className = "", ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className}`}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
}

export function ButtonLink({ variant = "solid", icon, children, className = "", ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...rest} className={`${base} ${variants[variant]} ${className}`}>
      <Inner icon={icon}>{children}</Inner>
    </a>
  );
}
