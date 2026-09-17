import type { Decision } from "./decide";
import { ICON_MAP } from "./icon-map";
import { Sparkles } from "lucide-react";
import { Render, BlockRender } from "@/components/canvas-panel";
import { elementToCode } from "./element-to-jsx";

// Real, copy-pasteable React — the actual element tree Render/BlockRender
// produce for this decision, serialized as-is. Not a synthetic <Tag {...props}/>
// stand-in: Render branches per component (Card's layout patterns, Button's
// icon placement, ...) and this shows exactly that branch's real JSX.
export function decisionToCode(decision: Decision): string {
  const element =
    decision.kind === "block"
      ? BlockRender({ blockId: decision.componentId, props: decision.props })
      : Render({
          componentId: decision.componentId,
          props: decision.props,
          motion: decision.style.motion,
          icon: ICON_MAP[decision.style.icon] ?? Sparkles,
        });

  return elementToCode(element);
}
