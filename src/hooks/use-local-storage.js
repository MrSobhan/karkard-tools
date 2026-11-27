"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { writeJSON } from "@/lib/storage";

function subscribe(cb) {
  window.addEventListener("storage", cb);
  window.addEventListener("karkard-storage", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("karkard-storage", cb);
  };
}

/** خواندن/نوشتن امن localStorage بدون ناهماهنگی hydration */
export function useLocalStorage(key, fallback) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const value = useMemo(() => {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);
  const set = useCallback((next) => writeJSON(key, next), [key]);
  return [value, set];
}
