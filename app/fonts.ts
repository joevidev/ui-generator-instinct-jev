import {
  Geist,
  Geist_Mono,
  Source_Serif_4,
  IBM_Plex_Mono,
  Space_Grotesk,
  Space_Mono,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const editorialSans = Source_Serif_4({ variable: "--font-editorial-sans", subsets: ["latin"] });
export const editorialMono = IBM_Plex_Mono({ variable: "--font-editorial-mono", subsets: ["latin"], weight: ["400", "500"] });

export const groteskSans = Space_Grotesk({ variable: "--font-grotesk-sans", subsets: ["latin"] });
export const groteskMono = Space_Mono({ variable: "--font-grotesk-mono", subsets: ["latin"], weight: ["400", "700"] });

export const classicSans = Inter({ variable: "--font-classic-sans", subsets: ["latin"] });
export const classicMono = JetBrains_Mono({ variable: "--font-classic-mono", subsets: ["latin"] });

export const FONT_VARIABLE_CLASS = [
  geistSans.variable,
  geistMono.variable,
  editorialSans.variable,
  editorialMono.variable,
  groteskSans.variable,
  groteskMono.variable,
  classicSans.variable,
  classicMono.variable,
].join(" ");
