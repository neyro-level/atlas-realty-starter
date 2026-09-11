import type { ComponentProps, HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { Label } from "./label";

export function FieldSet({ className, ...props }: ComponentProps<"fieldset">) {
  return <fieldset data-slot="field-set" className={cn("grid gap-4", className)} {...props} />;
}

export function FieldLegend({ className, ...props }: ComponentProps<"legend">) {
  return <legend data-slot="field-legend" className={cn("text-sm font-semibold text-[var(--text-primary)]", className)} {...props} />;
}

export function FieldGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field-group" className={cn("grid gap-4", className)} {...props} />;
}

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field" role="group" className={cn("grid gap-2", className)} {...props} />;
}

export function FieldContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field-content" className={cn("grid gap-1", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={cn("text-sm font-medium text-[var(--text-primary)]", className)} {...props} />;
}

export function FieldTitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="field-title" className={cn("text-sm font-medium text-[var(--text-primary)]", className)} {...props} />;
}

export function FieldDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="field-description" className={cn("text-xs leading-5 text-[var(--field-content-primary)]", className)} {...props} />;
}

export function FieldSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field-separator" className={cn("h-px w-full bg-[var(--border)]", className)} {...props} />;
}

export function FieldError({ className, errors, children, ...props }: HTMLAttributes<HTMLParagraphElement> & { errors?: Array<{ message?: string } | undefined> }) {
  const messages = errors?.map((error) => error?.message).filter(Boolean) as string[] | undefined;
  if (!children && (!messages || messages.length === 0)) {
    return null;
  }

  return (
    <p data-slot="field-error" className={cn("text-xs leading-5 text-[var(--accent)]", className)} {...props}>
      {children ?? messages?.join(" ")}
    </p>
  );
}
