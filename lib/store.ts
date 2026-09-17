import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Decision } from "./decide";

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
  setText: (text: string) => void;
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

      setText: (text) => set({ text }),

      submit: async () => {
        const { text } = get();
        set({ status: "loading", error: null });
        try {
          const res = await fetch("/api/decide", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (!res.ok) throw new Error(`Request failed: ${res.status}`);
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
      partialize: (s) => ({ history: s.history }),
    }
  )
);
