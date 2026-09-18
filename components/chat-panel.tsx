"use client";

import { useInstinctStore } from "@/lib/store";
import { EXAMPLE_PROMPTS } from "@/lib/example-prompts";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ApiKeyPanel } from "@/components/api-key-panel";
import { useIsMobile } from "@/hooks/use-mobile";

export function ChatPanel() {
  const { text, setText, submit, status, current, error, quotaExceeded, apiKey } = useInstinctStore();
  const isMobile = useIsMobile();
  const canSubmit = text.trim().length > 0 && status !== "loading";
  const blockedOnKey = quotaExceeded && apiKey.length === 0;
  const showSuggestions = !current && !blockedOnKey && text.trim().length === 0 && status !== "loading";

  const handleSubmit = (_message: PromptInputMessage, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) submit();
  };

  const handleSuggestion = (example: string) => {
    setText(example);
    submit();
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {showSuggestions && (
        <Carousel opts={{ align: "start", dragFree: true }} className="w-full rails:px-10">
          <CarouselContent className="-ml-1.5">
            {EXAMPLE_PROMPTS.map((example) => (
              <CarouselItem key={example} className="basis-auto pl-1.5">
                <button
                  type="button"
                  onClick={() => handleSuggestion(example)}
                  className="shadow-float max-w-[70vw] truncate rounded-full border border-border/60 bg-card/95 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground sm:max-w-[19rem] sm:py-1.5"
                  title={example}
                >
                  {example}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Arrows only where there's gutter to put them in; on touch the
              carousel is already dragged, so they'd be redundant chrome eating
              into the width the suggestions need. */}
          <CarouselPrevious className="-left-8 hidden size-7 rails:flex" />
          <CarouselNext className="-right-8 hidden size-7 rails:flex" />
        </Carousel>
      )}
      <ApiKeyPanel />
      <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
        {error && !blockedOnKey && <p className="px-3 text-xs text-destructive">{error}</p>}
        <PromptInput
          onSubmit={handleSubmit}
          className="shadow-float rounded-3xl border-border/60 bg-card/95 backdrop-blur-md transition-shadow has-[[data-slot=input-group-control]:focus-visible]:border-ring/60 has-[[data-slot=input-group-control]:focus-visible]:ring-0"
        >
          <PromptInputTextarea
            // The full prompt is three lines of placeholder, taller than the
            // composer gets on a phone, so it would just be clipped mid-sentence.
            placeholder={
              isMobile
                ? "Describe what the user needs, in your own words."
                : "Describe what the user needs, in your own words. Entity, fields, tone, even an icon, Jev works it out from this."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="max-h-28 min-h-12 px-3.5 py-3 sm:max-h-40 sm:px-4 sm:py-3.5"
          />
          <PromptInputFooter className="px-3 pb-3">
            <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Jev · one call, no free text
            </span>
            <PromptInputSubmit
              status={status === "loading" ? "submitted" : status === "error" ? "error" : "ready"}
              disabled={!canSubmit}
              className="rounded-full"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
