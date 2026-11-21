import { createElement, type ElementType } from "react";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** class on each animated inner word */
  wordClassName?: string;
  id?: string;
};

/**
 * Splits a plain-text heading into masked words for staggered reveals.
 * The full sentence stays in an sr-only twin, the split copy is aria-hidden,
 * and nothing is hidden by default — without JS the heading simply reads.
 */
export function SplitWords({ text, as = "h2", className = "", wordClassName = "", id }: Props) {
  const words = text.split(" ");
  return createElement(
    as,
    { className, id },
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={`${w}-${i}`}>
            <span className="split-mask">
              <span className={`split-inner ${wordClassName}`}>{w}</span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </>,
  );
}
