"use client";

import { LeadSuccessNoticeView } from "@ams/realty-ui";
import { useEffect, useRef, useState } from "react";
import { PUBLIC_LEAD_SUCCESS_EVENT } from "@/modules/analytics";

export function LeadSuccessNotice() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const show = () => {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
    window.addEventListener(PUBLIC_LEAD_SUCCESS_EVENT, show);
    return () => window.removeEventListener(PUBLIC_LEAD_SUCCESS_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    buttonRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    window.setTimeout(() => previousFocusRef.current?.focus(), 0);
  }

  if (!open) return null;

  return <LeadSuccessNoticeView onClose={close} closeButtonRef={buttonRef} />;
}
