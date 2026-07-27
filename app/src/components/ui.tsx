import type { ReactNode } from "react";

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-block">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-64 max-w-[80vw] rounded-lg border border-line bg-surface-2 p-2.5 text-xs font-normal leading-snug text-ink opacity-0 shadow-xl transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export function Card({
  title,
  icon,
  headerAction,
  children,
  className = "",
}: {
  title?: ReactNode;
  icon?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-surface p-4 ${className}`}
    >
      {title && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
            {icon && <span className="text-primary">{icon}</span>}
            {title}
          </h3>
          {headerAction}
        </div>
      )}
      {children}
    </section>
  );
}

const statusDot: Record<string, string> = {
  draft: "bg-ink-faint",
  submitted: "bg-warning",
  approved: "bg-secondary",
  confirmed: "bg-secondary",
  rejected: "bg-primary",
  Executado: "bg-secondary",
  Draft: "bg-ink-faint",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submetido",
  approved: "Aprovado",
  confirmed: "Confirmado",
  rejected: "Rejeitado",
  Executado: "Executado",
  Draft: "Draft",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status] ?? "bg-ink-faint"}`} />
      {statusLabels[status] ?? status}
    </span>
  );
}

export function conformanceColor(score: number) {
  if (score >= 80) return "bg-secondary";
  if (score >= 60) return "bg-warning";
  return "bg-primary";
}

export function conformanceTextColor(score: number) {
  if (score >= 80) return "text-secondary";
  if (score >= 60) return "text-warning";
  return "text-primary-text";
}

export function ProgressBar({
  value,
  colorClass,
  size = "md",
}: {
  value: number;
  colorClass?: string;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-full bg-surface-2 ${
        size === "sm" ? "h-1.5" : "h-2.5"
      }`}
    >
      <div
        className={`h-full rounded-full transition-all ${colorClass ?? conformanceColor(clamped)}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function TeamBadge({ team }: { team: "Amarelo" | "Azul" }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-muted">
      <span
        className={`h-2 w-2 rounded-full ${team === "Amarelo" ? "bg-team-amarelo" : "bg-team-azul"}`}
      />
      Team {team}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-primary-hover text-white hover:bg-primary-active",
    secondary:
      "bg-surface-2 text-ink border border-line hover:border-ink-faint",
    danger: "bg-primary-hover text-white hover:bg-primary-active",
    ghost: "text-ink-muted hover:bg-surface-2 hover:text-ink",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  required,
  children,
  hint,
  error,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium text-ink-muted">
        {label}
        {required && <span className="ml-0.5 text-primary-text">*</span>}
      </span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-primary-text">
          {error}
        </span>
      ) : (
        hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
      )}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 [color-scheme:dark]";

export const inputErrorClass =
  "w-full rounded-xl border border-primary-text bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary-text focus:outline-none focus:ring-2 focus:ring-primary/25 [color-scheme:dark]";
