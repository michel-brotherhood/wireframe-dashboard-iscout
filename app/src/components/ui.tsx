import type { ReactNode } from "react";

export function Card({
  title,
  icon,
  children,
  className = "",
}: {
  title?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
    >
      {title && (
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
          {icon}
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-300",
  submitted: "bg-amber-100 text-amber-700 border-amber-300",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-300",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
  Executado: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Draft: "bg-gray-100 text-gray-600 border-gray-300",
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
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        statusStyles[status] ?? "bg-gray-100 text-gray-600 border-gray-300"
      }`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

export function conformanceColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-500";
}

export function conformanceTextColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
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
      className={`w-full overflow-hidden rounded-full bg-gray-200 ${
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
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        team === "Amarelo"
          ? "bg-amber-100 text-amber-800"
          : "bg-blue-100 text-blue-900"
      }`}
    >
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
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-danger text-white hover:bg-red-600",
    ghost: "text-gray-600 hover:bg-gray-100",
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
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
