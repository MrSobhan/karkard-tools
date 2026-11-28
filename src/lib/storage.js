export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("karkard-storage", { detail: key }));
  } catch {
    return;
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent("karkard-storage", { detail: key }));
  } catch {
    return;
  }
}
