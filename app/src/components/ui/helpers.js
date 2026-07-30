export const inputClass =
  "w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 [color-scheme:dark]";

export const inputErrorClass =
  "w-full rounded-xl border border-primary-text bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary-text focus:outline-none focus:ring-2 focus:ring-primary/25 [color-scheme:dark]";

export function conformanceColor(score) {
  if (score >= 80) return "bg-secondary";
  if (score >= 60) return "bg-warning";
  return "bg-primary";
}

export function conformanceTextColor(score) {
  if (score >= 80) return "text-secondary";
  if (score >= 60) return "text-warning";
  return "text-primary-text";
}
