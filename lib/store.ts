import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Decision } from "./decide";
import { FREE_GENERATIONS, REMAINING_HEADER } from "./rate-limit";

export interface HistoryEntry {
  id: string;
  text: string;
  decision: Decision;
  createdAt: number;
}

interface InstinctState {
  text: string;
  history: HistoryEntry[];
  current: HistoryEntry | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  /** The visitor's own TypeSafe key, once the demo's free quota runs out.
   * Kept in this device's localStorage and sent per request; never stored
   * server-side. */
  apiKey: string;
  quotaExceeded: boolean;
  /** Free generations left on the shared key; null until the server has said. */
  freeRemaining: number | null;
  setText: (text: string) => void;
  setApiKey: (apiKey: string) => void;
  loadQuota: () => Promise<void>;
  submit: () => Promise<void>;
  view: (id: string) => void;
  remove: (id: string) => void;
}

export const useInstinctStore = create<InstinctState>()(
  persist(
    (set, get) => ({
      text: "",
      history: [],
      current: null,
      status: "idle",
      error: null,
      apiKey: "",
      quotaExceeded: false,
      freeRemaining: null,

      setText: (text) => set({ text }),

      setApiKey: (apiKey) => set({ apiKey, quotaExceeded: false, error: null }),

      loadQuota: async () => {
        try {
          const res = await fetch("/api/quota", { cache: "no-store" });
          if (!res.ok) return;
          const { remaining } = (await res.json()) as { remaining: number };
          set({ freeRemaining: remaining });
        } catch {
          // The badge is informational; stay hidden rather than surface an error.
        }
      },

      submit: async () => {
        const { text, apiKey } = get();
        set({ status: "loading", error: null });
        try {
          const res = await fetch("/api/decide", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, apiKey: apiKey || undefined }),
          });
          if (res.status === 429) {
            set({
              status: "error",
              quotaExceeded: true,
              freeRemaining: 0,
              error: `Free demo limit reached (${FREE_GENERATIONS} generations). Add your own TypeSafe API key to keep going.`,
            });
            return;
          }
          if (res.status === 401 || res.status === 402) {
            const body = (await res.json()) as { message?: string };
            set({ status: "error", error: body.message ?? `Request failed: ${res.status}` });
            return;
          }
          if (!res.ok) throw new Error(`Request failed: ${res.status}`);
          const remaining = res.headers.get(REMAINING_HEADER);
          if (remaining !== null) set({ freeRemaining: Number(remaining) });
          const decision: Decision = await res.json();
          const entry: HistoryEntry = {
            id: crypto.randomUUID(),
            text,
            decision,
            createdAt: Date.now(),
          };
          set((s) => ({
            status: "idle",
            text: "",
            current: entry,
            history: [entry, ...s.history].slice(0, 20),
          }));
        } catch (err) {
          set({ status: "error", error: err instanceof Error ? err.message : "Something went wrong." });
        }
      },

      view: (id) => {
        const entry = get().history.find((h) => h.id === id);
        if (entry) set({ current: entry });
      },

      remove: (id) => {
        set((s) => ({
          history: s.history.filter((h) => h.id !== id),
          current: s.current?.id === id ? null : s.current,
        }));
      },
    }),
    {
      name: "instinct-history",
      partialize: (s) => ({ history: s.history, apiKey: s.apiKey }),
    }
  )
);
