import { ChatPanel } from "@/components/chat-panel";
import { CanvasPanel } from "@/components/canvas-panel";
import { HistoryRail } from "@/components/history-rail";
import { ReasoningRail } from "@/components/reasoning-rail";
import { RailDrawers } from "@/components/rail-drawers";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex flex-none items-center justify-between gap-3 px-4 pt-4 pb-1 rails:px-6 rails:pt-5">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Instinct</p>
        {/* Below xl the two rails can't float beside the canvas, so the same
            content moves into bottom sheets reached from here. */}
        <div className="rails:hidden">
          <RailDrawers />
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {/* Centered on the full available area, not just the space left over between
            the two side rails — those are different widths (240 vs 380), so centering
            "between" them would offset the artifact off true screen-center. */}
        <div className="scroll-fade-y absolute inset-0 overflow-y-auto overflow-x-hidden">
          <CanvasPanel />
        </div>

        <aside className="pointer-events-none absolute inset-y-2 left-6 z-10 hidden w-[240px] rails:block">
          <div className="pointer-events-auto h-full">
            <HistoryRail />
          </div>
        </aside>

        <aside className="pointer-events-none absolute inset-y-2 right-6 z-10 hidden w-[380px] rails:block">
          <div className="pointer-events-auto h-full overflow-y-auto">
            <ReasoningRail />
          </div>
        </aside>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-3 rails:px-0">
          <div className="pointer-events-auto w-full max-w-2xl">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
