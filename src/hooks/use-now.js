"use client";
import { useSyncExternalStore } from "react";

let listeners = new Set();
let timer = null;
let tick = 0;

function subscribe(cb) {
  listeners.add(cb);
  if (!timer) {
    timer = setInterval(() => {
      tick += 1;
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** ساعت فعلی با به‌روزرسانی هر ثانیه؛ روی سرور null است. cleanup خودکار. */
export function useNow() {
  const t = useSyncExternalStore(
    subscribe,
    () => `${Math.floor(Date.now() / 1000)}:${tick}`,
    () => null,
  );
  return t === null ? null : new Date(Number(t.split(":")[0]) * 1000);
}
