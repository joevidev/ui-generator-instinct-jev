/**
 * Full-page blocks, shadcn Blocks parity: the same catalog discipline as
 * lib/catalog.ts (real ids, real descriptions verified against
 * ui.shadcn.com/blocks and `shadcn view <name>`, few-shot examples), one
 * level up from a single UI piece. Only reached when call 1's `scope` Noul
 * says the case needs a complete page section, not a component.
 */
export type BlockFamily = "dashboard" | "authentication";

export interface BlockEntry {
  id: string;
  label: string;
  family: BlockFamily;
  description: string;
}

export const BLOCK_CATALOG: BlockEntry[] = [
  { id: "dashboard-01", label: "Dashboard", family: "dashboard", description: "A full admin dashboard: sidebar navigation, a row of stat cards, a chart, and a data table. Example: an analytics home screen." },
  { id: "sidebar-01", label: "Sidebar (grouped)", family: "dashboard", description: "A simple sidebar with navigation grouped by section. Example: a docs site nav grouped by Getting Started, Guides, API." },
  { id: "sidebar-02", label: "Sidebar (collapsible sections)", family: "dashboard", description: "A sidebar where each navigation section can be expanded or collapsed. Example: a nav with many groups where most stay collapsed." },
  { id: "sidebar-03", label: "Sidebar (submenus)", family: "dashboard", description: "A sidebar with submenus, top-level items expand to reveal nested links. Example: a Settings item expanding to Profile, Billing, Team." },
  { id: "sidebar-04", label: "Sidebar (floating)", family: "dashboard", description: "A floating sidebar with submenus, visually detached from the page edge with rounded corners and a shadow. Example: a premium consumer product's nav." },
  { id: "sidebar-05", label: "Sidebar (collapsible submenus)", family: "dashboard", description: "A sidebar with collapsible submenus, nested links that expand and collapse independently. Example: a deeply nested docs nav." },
  { id: "sidebar-06", label: "Sidebar (dropdown submenus)", family: "dashboard", description: "A sidebar whose submenus open as dropdowns instead of expanding inline. Example: a compact nav that avoids growing the sidebar's height." },
  { id: "sidebar-07", label: "Sidebar (icon collapse)", family: "dashboard", description: "A sidebar that collapses down to just icons, saving space while keeping navigation reachable. Example: a power-user tool with a dense workspace." },
  { id: "sidebar-08", label: "Sidebar (inset)", family: "dashboard", description: "A sidebar with an inset content area, the main content sits in its own rounded, bordered panel next to the sidebar. Example: a modern SaaS app shell." },
  { id: "sidebar-09", label: "Sidebar (icon collapse, submenus)", family: "dashboard", description: "A sidebar that collapses to icons and still supports submenus. Example: a dense admin tool with nested sections." },
  { id: "sidebar-10", label: "Sidebar (compact floating)", family: "dashboard", description: "A compact floating sidebar that favors icon-only navigation, closer to a popover of controls than a full nav column. Example: a minimal tool palette." },
  { id: "login-01", label: "Login (simple)", family: "authentication", description: "A simple, single-column login form, centered on the page. Example: a straightforward internal-tool sign-in." },
  { id: "login-02", label: "Login (split image)", family: "authentication", description: "A two column login page with a cover image, form on one side, a large photo or illustration on the other. Example: a consumer product's sign-in with brand photography." },
  { id: "login-03", label: "Login (muted background)", family: "authentication", description: "A login page with a muted, softly colored background behind a centered form card. Example: a calmer, less stark sign-in screen." },
  { id: "login-04", label: "Login (form and image)", family: "authentication", description: "A login page with the form and a supporting image together, similar to a split layout but more compact. Example: a login with a small brand illustration beside the fields." },
  { id: "login-05", label: "Login (email only)", family: "authentication", description: "A minimal login page asking only for an email address, no password field. Example: a magic-link or OTP sign-in flow." },
  { id: "signup-01", label: "Signup", family: "authentication", description: "A simple signup form collecting name, email, and password, centered on the page. Example: a new account creation screen." },
];

export const BLOCK_FAMILY_MEMBERS: Record<BlockFamily, BlockEntry[]> = BLOCK_CATALOG.reduce(
  (acc, entry) => {
    acc[entry.family].push(entry);
    return acc;
  },
  { dashboard: [], authentication: [] } as Record<BlockFamily, BlockEntry[]>
);

export const BLOCK_FAMILY_DESCRIPTIONS: Record<BlockFamily, string> = {
  dashboard: "A full app shell: sidebar navigation, optionally with a dashboard of stats and data. Example: an admin panel, an analytics home screen.",
  authentication: "A full sign-in, sign-up, or account-access page. Example: a login screen, a create-account screen.",
};

export function blockFamilyOf(id: string): BlockFamily | undefined {
  return BLOCK_CATALOG.find((b) => b.id === id)?.family;
}
