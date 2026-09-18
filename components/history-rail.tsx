"use client";

import { useInstinctStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/lib/icon-map";
import { Sparkles, X } from "lucide-react";

/**
 * `bare` drops the floating-card chrome for when the rail is already inside a
 * surface of its own (the mobile bottom sheet), and `onSelect` lets that sheet
 * close itself once a past generation is picked.
 */
export function HistoryRail({ bare = false, onSelect }: { bare?: boolean; onSelect?: () => void }) {
  const { history, current, status, view, remove } = useInstinctStore();

  if (history.length === 0 && status !== "loading") {
    return (
      <p className="px-1 text-xs text-muted-foreground">
        Past generations show up here, clickable, saved on this device.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex max-h-full flex-col overflow-hidden",
        !bare && "shadow-float rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm"
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-col gap-0.5 overflow-y-auto",
          bare ? "pb-2" : "scroll-fade-y p-1.5"
        )}
      >
        {status === "loading" && (
          <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2">
            <div className="shimmer size-4 shrink-0 rounded-md" />
            <div className="shimmer h-3 w-2/3 rounded-md" />
          </div>
        )}
        {history.map((entry) => {
          const Icon = ICON_MAP[entry.decision.style.icon] ?? Sparkles;
          const isActive = current?.id === entry.id;
          return (
            <div
              key={entry.id}
              className={cn(
                "group flex items-center gap-1 rounded-xl pr-1.5 transition-colors hover:bg-accent",
                isActive && "bg-accent"
              )}
            >
              <button
                onClick={() => {
                  view(entry.id);
                  onSelect?.();
                }}
                className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 pl-2.5 text-left text-sm rails:py-2"
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                <span className="truncate">{entry.decision.label}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(entry.id);
                }}
                aria-label="Delete"
                // Always visible on touch: there is no hover to reveal it, and a
                // 32px target is the smallest that's reliably tappable.
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-opacity hover:text-foreground rails:size-6 rails:opacity-0 rails:group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
