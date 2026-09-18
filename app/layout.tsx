import type { Metadata, Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FONT_VARIABLE_CLASS } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instinct — describe it, Jev decides",
  description: "A structured case in, the right shadcn component out. One Jev call, no free text generation.",
};

// `interactive-widget: resizes-content` so the on-screen keyboard shrinks the
// layout viewport instead of sliding the whole page up: the composer is pinned
// to the bottom of a `h-dvh` shell, and without this it gets pushed out of
// sight the moment the textarea takes focus on mobile.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${FONT_VARIABLE_CLASS} h-dvh antialiased`}>
      <body className="flex h-dvh flex-col overflow-hidden overscroll-none">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
