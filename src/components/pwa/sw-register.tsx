"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // registro do service worker é best-effort; app continua funcionando sem PWA offline
      });
    }
  }, []);

  return null;
}
