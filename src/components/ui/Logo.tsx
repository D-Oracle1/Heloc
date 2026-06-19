interface LogoProps {
  /** Tailwind height class, e.g. "h-7". Width scales automatically. */
  className?: string;
  /** Wrap in a white chip for use on dark backgrounds. */
  chip?: boolean;
  /** Render only the square emblem — for tight spaces. */
  mark?: boolean;
}

/** The American Pride Bank wordmark, used as the app's brand across pages. */
export function Logo({ className = 'h-7', chip = false, mark = false }: LogoProps) {
  if (mark) {
    return <img src="/apb-mark.svg" alt="American Pride Bank" className={`${className} w-auto select-none`} draggable={false} />;
  }
  const img = <img src="/apb-logo.svg" alt="American Pride Bank" className={`${className} w-auto select-none`} draggable={false} />;
  if (chip) {
    return <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm">{img}</span>;
  }
  return img;
}
