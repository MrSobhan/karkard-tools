"use client";
import { useSyncExternalStore } from "react";

let listeners = new Set();
let intervalId = null;
let tickCount = 0;

function subscribe(callback) {
  listeners.add(callback);
  if (!intervalId) {
    intervalId = setInterval(() => {
      tickCount += 1;
      listeners.forEach((listener) => listener());
    }, 1000);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export function useNow() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => `${Math.floor(Date.now() / 1000)}:${tickCount}`,
    () => null,
  );
  return snapshot === null ? null : new Date(Number(snapshot.split(":")[0]) * 1000);
}
