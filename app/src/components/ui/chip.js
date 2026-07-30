export function chipClass(active) {
  return `inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? "border-primary bg-primary/10 text-primary-text"
      : "border-line bg-surface-2 text-ink-muted hover:border-ink-faint hover:text-ink"
  }`;
}
