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

export function ChatPanel() {
  const { text, setText, submit, status, current, error } = useInstinctStore();
  const canSubmit = text.trim().length > 0 && status !== "loading";
  const showSuggestions = !current && text.trim().length === 0 && status !== "loading";

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
        <Carousel opts={{ align: "start", dragFree: true }} className="w-full px-10">
          <CarouselContent className="-ml-1.5">
            {EXAMPLE_PROMPTS.map((example) => (
              <CarouselItem key={example} className="basis-auto pl-1.5">
                <button
                  type="button"
                  onClick={() => handleSuggestion(example)}
                  className="shadow-float truncate rounded-full border border-border/60 bg-card/95 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground max-w-[19rem]"
                  title={example}
                >
                  {example}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-8 size-7" />
          <CarouselNext className="-right-8 size-7" />
        </Carousel>
      )}
      <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
        {error && <p className="px-3 text-xs text-destructive">{error}</p>}
        <PromptInput
          onSubmit={handleSubmit}
          className="shadow-float rounded-3xl border-border/60 bg-card/95 backdrop-blur-md transition-shadow has-[[data-slot=input-group-control]:focus-visible]:border-ring/60 has-[[data-slot=input-group-control]:focus-visible]:ring-0"
        >
          <PromptInputTextarea
            placeholder="Describe what the user needs, in your own words. Entity, fields, tone, even an icon, Jev works it out from this."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="max-h-40 min-h-12 px-4 py-3.5"
          />
          <PromptInputFooter className="px-3 pb-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
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
