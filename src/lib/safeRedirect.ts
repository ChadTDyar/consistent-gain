/**
 * Returns `raw` only when it is a same-site relative path (starts with a
 * single "/"). Rejects protocol-relative ("//evil.com"), backslash tricks
 * ("/\\evil.com"), absolute URLs and "javascript:" style values.
 * Returns null for anything unsafe so callers fall back to their default.
 */
export function safeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  // Control characters (tabs/newlines) can be stripped by browsers and turn
  // "/\t/evil.com" into "//evil.com".
  if (/[\u0000-\u001F\u007F]/.test(value)) return null;
  if (/^\/+[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  return value;
}
