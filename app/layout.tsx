import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FONT_VARIABLE_CLASS } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instinct — describe it, Jev decides",
  description: "A structured case in, the right shadcn component out. One Jev call, no free text generation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${FONT_VARIABLE_CLASS} h-full antialiased`}>
      <body className="h-full flex flex-col overflow-hidden">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
