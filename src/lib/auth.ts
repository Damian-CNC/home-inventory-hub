const PASSWORD = "Kotusie2026";
const KEY = "ho.auth.until";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export function checkPassword(value: string) {
  return value === PASSWORD;
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  const until = Number(localStorage.getItem(KEY) ?? 0);
  return until > Date.now();
}

export function rememberAuth() {
  localStorage.setItem(KEY, String(Date.now() + THIRTY_DAYS));
}

export function sessionAuth() {
  // Krótka sesja — do końca przeglądarki (1 dzień)
  localStorage.setItem(KEY, String(Date.now() + 24 * 60 * 60 * 1000));
}

export function logout() {
  localStorage.removeItem(KEY);
}
