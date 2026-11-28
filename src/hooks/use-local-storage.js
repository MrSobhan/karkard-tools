"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { writeJSON } from "@/lib/storage";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("karkard-storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("karkard-storage", callback);
  };
}

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

  const setValue = useCallback((next) => writeJSON(key, next), [key]);

  return [value, setValue];
}
