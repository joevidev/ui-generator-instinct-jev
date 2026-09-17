import { ChatPanel } from "@/components/chat-panel";
import { CanvasPanel } from "@/components/canvas-panel";
import { HistoryRail } from "@/components/history-rail";
import { ReasoningRail } from "@/components/reasoning-rail";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex-none px-6 pt-5 pb-1">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Instinct</p>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {/* Centered on the full available area, not just the space left over between
            the two side rails — those are different widths (240 vs 380), so centering
            "between" them would offset the artifact off true screen-center. */}
        <div className="scroll-fade-y absolute inset-0 overflow-y-auto">
          <CanvasPanel />
        </div>

        <aside className="pointer-events-none absolute inset-y-2 left-6 z-10 w-[240px]">
          <div className="pointer-events-auto h-full">
            <HistoryRail />
          </div>
        </aside>

        <aside className="pointer-events-none absolute inset-y-2 right-6 z-10 w-[380px]">
          <div className="pointer-events-auto h-full overflow-y-auto">
            <ReasoningRail />
          </div>
        </aside>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-3">
          <div className="pointer-events-auto w-full max-w-2xl">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
