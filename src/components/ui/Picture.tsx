/* eslint-disable @next/next/no-img-element -- images are pre-optimised to responsive WebP by scripts/process-images.mjs and the site is a static export */
import type { CSSProperties } from "react";
import { IMAGES, type ImageSlug } from "@/lib/images.generated";

type Props = {
  slug: ImageSlug;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** object-position for the crop */
  position?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  decorative?: boolean;
};

/**
 * Art-directed responsive image: fixed intrinsic size (no layout shift),
 * blurred inline placeholder behind it, lazy below the fold.
 */
export function Picture({
  slug,
  alt,
  sizes,
  className = "",
  imgClassName = "",
  priority = false,
  position = "50% 50%",
  style,
  imgStyle,
  decorative = false,
}: Props) {
  const img = IMAGES[slug];
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className);
  return (
    <div
      className={`${positioned ? "" : "relative "}overflow-hidden bg-coal ${className}`}
      style={{ backgroundImage: `url(${img.placeholder})`, backgroundSize: "cover", backgroundPosition: position, ...style }}
    >
      <img
        src={img.src}
        srcSet={img.srcSet}
        sizes={sizes}
        width={img.width}
        height={img.height}
        alt={decorative ? "" : alt}
        aria-hidden={decorative || undefined}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        draggable={false}
        className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        style={{ objectPosition: position, ...imgStyle }}
      />
    </div>
  );
}
