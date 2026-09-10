"use client";

import { useEffect, useRef } from "react";

const TELEGRAM_AUTH_URL = "https://tgqluctxigvgzevxrxkj.supabase.co/functions/v1/telegram-auth";

export default function TelegramLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", "poinstprobot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-auth-url", TELEGRAM_AUTH_URL);
    script.setAttribute("data-request-access", "write");
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div className="mt-4 rounded-2xl border border-[#229ED9]/30 bg-[#229ED9]/10 p-3">
      <p className="mb-2 text-center text-xs font-semibold text-slate-300">Or continue securely with Telegram</p>
      <div ref={containerRef} className="flex min-h-[44px] justify-center" />
    </div>
  );
}
