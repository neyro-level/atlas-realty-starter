"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

export function SheetOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay data-slot="sheet-overlay" className={cn("fixed inset-0 z-50 bg-[rgba(23,22,26,0.2)] backdrop-blur-[2px]", className)} {...props} />;
}

const sheetVariants = cva(
  "fixed z-50 grid gap-4 bg-white p-6 shadow-[0_28px_80px_rgba(24,22,24,0.18)] transition ease-in-out sm:p-8",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-[var(--border)]",
        bottom: "inset-x-0 bottom-0 border-t border-[var(--border)]",
        left: "inset-y-0 left-0 h-full w-[min(92vw,420px)] border-r border-[var(--border)]",
        right: "inset-y-0 right-0 h-full w-[min(92vw,420px)] border-l border-[var(--border)]",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

export function SheetContent({ side = "right", className, children, showClose = true, ...props }: ComponentProps<typeof DialogPrimitive.Content> & VariantProps<typeof sheetVariants> & { showClose?: boolean }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content data-slot="sheet-content" className={cn(sheetVariants({ side }), className)} {...props}>
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-lg bg-[var(--palette-f5f5f3)] text-[var(--text-secondary)] transition hover:bg-[var(--palette-ecebe8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            aria-label="Закрыть"
          >
            <X className="size-5" aria-hidden />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("grid gap-2 text-left", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-3", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="sheet-title" className={cn("text-xl font-semibold text-[var(--text-primary)]", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="sheet-description" className={cn("text-sm leading-6 text-[var(--palette-5b5860)]", className)} {...props} />;
}
