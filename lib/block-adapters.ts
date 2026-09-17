import type { Intake } from "./intake";

export type SidebarVariant = "sidebar" | "floating" | "inset";
export type SidebarCollapsible = "offcanvas" | "icon" | "none";
export type MenuStyle = "grouped" | "collapsible" | "submenu" | "dropdown";

export interface SidebarBlockProps {
  variant: SidebarVariant;
  collapsible: SidebarCollapsible;
  menuStyle: MenuStyle;
  orgName: string;
  items: string[];
}

/**
 * Real, confirmed shadcn `Sidebar` props (`variant`, `collapsible`, verified
 * against the installed components/ui/sidebar.tsx), not invented. `sidebar-10`
 * ("compact floating", closest live analogue to a popover-style nav) is
 * approximated as floating+icon rather than a true popover shell, a scoped
 * fidelity tradeoff, not a routing gap: the leaf is still real and selectable.
 */
const SIDEBAR_CONFIG: Record<string, { variant: SidebarVariant; collapsible: SidebarCollapsible; menuStyle: MenuStyle }> = {
  "dashboard-01": { variant: "sidebar", collapsible: "offcanvas", menuStyle: "grouped" },
  "sidebar-01": { variant: "sidebar", collapsible: "offcanvas", menuStyle: "grouped" },
  "sidebar-02": { variant: "sidebar", collapsible: "offcanvas", menuStyle: "collapsible" },
  "sidebar-03": { variant: "sidebar", collapsible: "offcanvas", menuStyle: "submenu" },
  "sidebar-04": { variant: "floating", collapsible: "offcanvas", menuStyle: "grouped" },
  "sidebar-05": { variant: "sidebar", collapsible: "offcanvas", menuStyle: "submenu" },
  "sidebar-06": { variant: "sidebar", collapsible: "offcanvas", menuStyle: "dropdown" },
  "sidebar-07": { variant: "sidebar", collapsible: "icon", menuStyle: "grouped" },
  "sidebar-08": { variant: "inset", collapsible: "offcanvas", menuStyle: "grouped" },
  "sidebar-09": { variant: "sidebar", collapsible: "icon", menuStyle: "submenu" },
  "sidebar-10": { variant: "floating", collapsible: "icon", menuStyle: "grouped" },
};

export interface AuthBlockProps {
  isSignup: boolean;
  layout: "single" | "split-image";
  background: "default" | "muted";
  fields: "full" | "email-only";
  hasSignupLink: boolean;
  appName: string;
}

/** Real, confirmed shadcn auth block differences (single vs split-image layout, muted background, email-only field set). */
const AUTH_CONFIG: Record<string, Omit<AuthBlockProps, "appName">> = {
  "login-01": { isSignup: false, layout: "single", background: "default", fields: "full", hasSignupLink: true },
  "login-02": { isSignup: false, layout: "split-image", background: "default", fields: "full", hasSignupLink: true },
  "login-03": { isSignup: false, layout: "single", background: "muted", fields: "full", hasSignupLink: true },
  "login-04": { isSignup: false, layout: "split-image", background: "default", fields: "full", hasSignupLink: false },
  "login-05": { isSignup: false, layout: "single", background: "default", fields: "email-only", hasSignupLink: false },
  "signup-01": { isSignup: true, layout: "single", background: "default", fields: "full", hasSignupLink: false },
};

export function adaptSidebarProps(blockId: string, intake: Intake): SidebarBlockProps {
  const config = SIDEBAR_CONFIG[blockId] ?? SIDEBAR_CONFIG["sidebar-01"];
  const items = intake.fields.length > 0 ? intake.fields : ["Overview", "Activity", "Settings"];
  return { ...config, orgName: intake.entity || "Acme Inc.", items };
}

export function adaptAuthProps(blockId: string, intake: Intake): AuthBlockProps {
  const config = AUTH_CONFIG[blockId] ?? AUTH_CONFIG["login-01"];
  return { ...config, appName: intake.entity || "Acme Inc." };
}
