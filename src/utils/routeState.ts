export function resolveListPath(state: unknown, fallbackPath: string) {
  if (state && typeof state === "object" && "from" in state) {
    const candidate = (state as { from?: unknown }).from;
    if (typeof candidate === "string" && candidate.startsWith("/")) {
      return candidate;
    }
  }

  return fallbackPath;
}
