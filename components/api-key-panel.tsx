"use client";

import { useState } from "react";
import { useInstinctStore } from "@/lib/store";
import { FREE_GENERATIONS } from "@/lib/rate-limit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Check, X } from "lucide-react";

/** Shown once the shared demo quota runs out. Past that point a visitor
 * spends their own TypeSafe credits, which is also the intended path for
 * anyone who clones this repo. */
export function ApiKeyPanel() {
  const { apiKey, quotaExceeded, setApiKey } = useInstinctStore();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  const hasKey = apiKey.length > 0;
  const expanded = open || (quotaExceeded && !hasKey);

  if (!expanded) {
    if (!hasKey) return null;
    return (
      <div className="mx-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shadow-float flex items-center gap-1.5 rounded-full border border-border/60 bg-card/95 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground"
        >
          <Check className="size-3" />
          Your own key
        </button>
        <button
          type="button"
          onClick={() => setApiKey("")}
          aria-label="Remove key"
          className="shadow-float flex size-7 items-center justify-center rounded-full border border-border/60 bg-card/95 text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="shadow-float mx-auto flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-border/60 bg-card/95 p-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <KeyRound className="size-3.5 text-muted-foreground" />
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {hasKey ? "Your TypeSafe API key" : `Free demo limit reached — ${FREE_GENERATIONS} generations`}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Add your own key from{" "}
        <a
          href="https://console.typesafe.ai"
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-2"
        >
          console.typesafe.ai
        </a>{" "}
        to keep going. It stays in this browser and is sent only with your own requests.
      </p>
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const next = draft.trim();
          if (!next) return;
          setApiKey(next);
          setDraft("");
          setOpen(false);
        }}
      >
        <Input
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="ts_..."
          autoComplete="off"
          className="flex-1 font-mono text-xs"
        />
        <Button type="submit" size="sm" disabled={draft.trim().length === 0}>
          Save
        </Button>
        {(hasKey || open) && (
          <Button type="button" size="sm" variant="ghost" onClick={() => { setOpen(false); setDraft(""); }}>
            Cancel
          </Button>
        )}
      </form>
    </div>
  );
}
