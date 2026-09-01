"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

type FooterPhoneRevealProps = {
  phone: string;
  phoneHref: string;
};

export function FooterPhoneReveal({ phone, phoneHref }: FooterPhoneRevealProps) {
  const [visible, setVisible] = useState(false);

  if (visible) {
    return (
      <a
        href={phoneHref}
        className="site-footer__phone site-footer__phone--revealed tabular-nums"
        data-analytics-context="site_footer"
      >
        <Phone className="site-footer__phone-icon" aria-hidden />
        <span>{phone}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      className="site-footer__phone site-footer__phone--hidden tabular-nums"
      data-analytics-event="phone_reveal"
      data-analytics-context="site_footer"
      onClick={() => setVisible(true)}
      aria-label="Показать номер телефона"
    >
      <Phone className="site-footer__phone-icon" aria-hidden />
      <span>+7...Показать</span>
    </button>
  );
}
