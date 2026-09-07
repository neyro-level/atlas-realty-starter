import * as React from "react";
import { cn } from "../../lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea"> & { unstyled?: boolean }>(function Textarea(
  { className, unstyled = false, ...props },
  ref,
) {
  return <textarea ref={ref} data-slot="textarea" className={unstyled ? className : cn("min-h-24 w-full rounded-[var(--radius)] border border-[var(--input)] bg-transparent px-3 py-2 text-base text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--ring)_24%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)} {...props} />;
});
