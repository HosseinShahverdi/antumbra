import { ICONS, type IconName } from "@/lib/icons.generated";

type Props = {
  name: IconName;
  size?: number | string;
  className?: string;
  label?: string;
};

/** Solar icon (Iconify) rendered inline from the extracted local set. */
export function Icon({ name, size = "1em", className, label }: Props) {
  const icon = ICONS[name];
  return (
    <svg
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      width={size}
      height={size}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
