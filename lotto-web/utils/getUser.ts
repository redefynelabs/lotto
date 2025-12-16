export function getUserFromBrowser() {
  if (typeof document === "undefined") return null;

  const cookieStr = document.cookie
    .split("; ")
    .find((row) => row.startsWith("app_user="));

  if (!cookieStr) return null;

  try {
    const raw = decodeURIComponent(cookieStr.split("=")[1]);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
