import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { useCurrentUser } from "../state/SessionContext";
import { usePlanos } from "../state/PlanosContext";
import { treinos } from "../data/mockData";
import { buildNotifications, type NotificationTone } from "../data/notifications";

const toneClasses: Record<NotificationTone, string> = {
  info: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  success: "bg-secondary/15 text-secondary",
};

export function NotificationBell() {
  const user = useCurrentUser();
  const { planos } = usePlanos();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  // Notificações "lidas" ficam só em memória (protótipo mock).
  const [read, setRead] = useState<Set<string>>(new Set());

  const notifications = useMemo(
    () => buildNotifications(user, planos, treinos),
    [user, planos],
  );
  const unread = notifications.filter((n) => !read.has(n.id)).length;

  function markAllRead() {
    setRead(new Set(notifications.map((n) => n.id)));
  }

  function handleClick(id: string, to?: string) {
    setRead((prev) => new Set(prev).add(id));
    setOpen(false);
    if (to) navigate(to);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notificações${unread > 0 ? ` (${unread} não lidas)` : ""}`}
        aria-expanded={open}
        className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
      >
        <Icon name="bell" className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop para fechar ao clicar fora. */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="dialog"
            aria-label="Notificações"
            className="fixed inset-x-3 top-[4.5rem] z-50 overflow-hidden rounded-xl border border-line bg-surface shadow-xl shadow-black/40 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80"
          >
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
              <span className="text-sm font-semibold text-ink">Notificações</span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-primary-text hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">Nenhuma notificação no momento.</p>
            ) : (
              <ul className="max-h-[70vh] overflow-y-auto overscroll-contain sm:max-h-96">
                {notifications.map((n) => {
                  const isUnread = !read.has(n.id);
                  const content = (
                    <>
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses[n.tone]}`}
                      >
                        <Icon name={n.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink">{n.title}</span>
                          {isUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted">{n.detail}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={n.id} className="border-b border-line-soft last:border-0">
                      {n.to ? (
                        <button
                          type="button"
                          onClick={() => handleClick(n.id, n.to)}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 ${
                            isUnread ? "bg-primary/5" : ""
                          }`}
                        >
                          {content}
                        </button>
                      ) : (
                        <div
                          onClick={() => handleClick(n.id)}
                          className={`flex cursor-default items-start gap-3 px-4 py-3 ${isUnread ? "bg-primary/5" : ""}`}
                        >
                          {content}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
