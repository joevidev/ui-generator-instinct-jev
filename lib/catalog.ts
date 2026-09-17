export type Family =
  | "action"
  | "data_display"
  | "input"
  | "navigation"
  | "feedback"
  | "overlay"
  | "layout";

export interface CatalogEntry {
  id: string;
  label: string;
  family: Family;
  description: string;
  /** Has bespoke Jev fill questions and a live adapter; the rest render from intake alone. */
  deep: boolean;
}

export const CATALOG: CatalogEntry[] = [
  { id: "button", label: "Button", family: "action", deep: true, description: "A single primary or secondary action the user takes right now. Example: \"Approve invoice\", \"Save changes\"." },

  { id: "card", label: "Card", family: "data_display", deep: true, description: "A titled summary of one thing: a record, a fact, a highlight. Example: one customer's profile summary." },
  { id: "table", label: "Table", family: "data_display", deep: true, description: "A list of many similar records the user needs to scan or compare. Example: a list of unpaid invoices with amount and due date." },
  { id: "badge", label: "Badge", family: "data_display", deep: false, description: "A short status or category label attached to something else. Example: \"Paid\", \"Overdue\", \"Draft\"." },
  { id: "avatar", label: "Avatar", family: "data_display", deep: false, description: "A person or entity's identity shown as an initial or image. Example: a user's profile picture in a member list." },

  { id: "select", label: "Select", family: "input", deep: true, description: "Choosing exactly one option from a known, short list. Example: picking a country or a plan tier." },
  { id: "input", label: "Input", family: "input", deep: false, description: "A single free text or number value the user types in. Example: a search box or an email field." },
  { id: "checkbox", label: "Checkbox", family: "input", deep: false, description: "Toggling several independent yes or no options. Example: choosing which notification types to receive." },
  { id: "switch", label: "Switch", family: "input", deep: false, description: "Toggling a single setting on or off, with immediate effect. Example: \"Enable dark mode\"." },
  { id: "textarea", label: "Textarea", family: "input", deep: false, description: "A longer free text passage the user writes, like notes or a message. Example: leaving a review or a support message." },

  { id: "tabs", label: "Tabs", family: "navigation", deep: true, description: "Switching between a few peer views of the same case without leaving the page. Example: \"Overview\" vs \"Activity\" on a project page." },
  { id: "breadcrumb", label: "Breadcrumb", family: "navigation", deep: false, description: "Showing where the user is inside a hierarchy, with a way back up. Example: Home / Projects / Invoices." },
  { id: "pagination", label: "Pagination", family: "navigation", deep: false, description: "Moving through a list too long to show all at once. Example: page 2 of 40 search results." },

  { id: "alert", label: "Alert", family: "feedback", deep: true, description: "A message that calls attention to something the user should notice now. Example: \"Your payment failed\" banner at the top of a page." },
  { id: "progress", label: "Progress", family: "feedback", deep: false, description: "How far along a single ongoing process is. Example: a file upload at 60%." },
  { id: "skeleton", label: "Skeleton", family: "feedback", deep: false, description: "Placeholder shape for content that is still loading. Example: gray bars where a table will appear." },

  { id: "dialog", label: "Dialog", family: "overlay", deep: true, description: "Interrupting the user to confirm or collect something before continuing, blocking the rest of the page until they respond. Example: \"Delete this invoice? This cannot be undone.\"" },
  { id: "sheet", label: "Sheet", family: "overlay", deep: false, description: "A panel that slides in from an edge with more detail, without leaving the page or blocking it entirely. Example: viewing a full order's detail while the list stays visible behind it." },
  { id: "popover", label: "Popover", family: "overlay", deep: false, description: "A small floating panel anchored to a control, for a short secondary task, not a full form or confirmation. Example: a color picker or a quick filter next to a button." },
  { id: "tooltip", label: "Tooltip", family: "overlay", deep: false, description: "A one line hint that explains a control on hover or focus, with no interaction of its own. Example: hovering an icon-only button to learn what it does." },
  { id: "dropdown-menu", label: "Dropdown menu", family: "overlay", deep: false, description: "A list of actions or options anchored to a trigger, chosen one at a time, then the menu closes. Example: a row's \"...\" menu with Edit, Duplicate, Delete." },

  { id: "accordion", label: "Accordion", family: "layout", deep: true, description: "Several titled sections the user expands one at a time to save space. Example: an FAQ list." },
  { id: "separator", label: "Separator", family: "layout", deep: false, description: "A visual divider between unrelated groups of content. Example: the line between a form's fields and its footer buttons." },
  { id: "collapsible", label: "Collapsible", family: "layout", deep: false, description: "One section the user can show or hide, unlike accordion this is a single toggle, not a group of peers. Example: \"Show advanced options\"." },
  { id: "scroll-area", label: "Scroll area", family: "layout", deep: false, description: "A fixed-height region with a custom scrollbar for content that would otherwise overflow. Example: a long list inside a fixed-size panel." },
  { id: "resizable", label: "Resizable panels", family: "layout", deep: true, description: "Two or more panels side by side that the user can resize by dragging the divider. Example: a file list next to a preview pane." },

  { id: "button-group", label: "Button group", family: "action", deep: true, description: "Several related actions presented together as one unit. Example: \"Bold / Italic / Underline\" or \"Approve / Reject\" side by side." },

  { id: "aspect-ratio", label: "Aspect ratio", family: "data_display", deep: false, description: "Constraining media to a fixed width-to-height shape so it never distorts. Example: a 16:9 video thumbnail." },
  { id: "carousel", label: "Carousel", family: "data_display", deep: true, description: "Several similar items the user swipes or clicks through one screen at a time. Example: product photos or featured items." },
  { id: "chart", label: "Chart", family: "data_display", deep: true, description: "Numeric data plotted visually to show a trend or comparison. Example: monthly revenue over the last year." },
  { id: "item", label: "Item", family: "data_display", deep: true, description: "One row in a list of similar things, simpler than a table, with optional media and an action. Example: a notification or a file in a list." },
  { id: "empty", label: "Empty state", family: "data_display", deep: false, description: "What to show when a list or search has nothing to display yet. Example: \"No invoices yet\" with a hint to create one." },

  { id: "combobox", label: "Combobox", family: "input", deep: false, description: "Choosing one option from a long list by typing to filter it, unlike select this is searchable. Example: picking a country from 190 options." },
  { id: "radio-group", label: "Radio group", family: "input", deep: true, description: "Choosing exactly one option from a few visible choices, all shown at once, unlike select nothing is hidden. Example: \"Monthly\" vs \"Yearly\" billing." },
  { id: "slider", label: "Slider", family: "input", deep: false, description: "Choosing a number or range by dragging, when the exact value matters less than the position. Example: setting a price range filter." },
  { id: "toggle", label: "Toggle", family: "input", deep: false, description: "A single pressable on/off control styled like a button, not a switch. Example: a bold/italic formatting toggle in a toolbar." },
  { id: "toggle-group", label: "Toggle group", family: "input", deep: false, description: "Choosing one or several options from a small row of pressable buttons. Example: view mode \"List / Grid / Board\"." },
  { id: "input-group", label: "Input group", family: "input", deep: false, description: "A text input with an attached icon, button, or unit. Example: a search box with a magnifier icon, or an amount field with a currency prefix." },
  { id: "input-otp", label: "One-time code input", family: "input", deep: false, description: "Entering a short numeric or alphanumeric code, one character per box. Example: a 6-digit SMS verification code." },
  { id: "field", label: "Field", family: "input", deep: false, description: "A single labeled input with its own description and validation message, the building block of a longer form. Example: an \"Email\" field with a hint and an error line." },

  { id: "command", label: "Command palette", family: "navigation", deep: true, description: "A searchable list of actions or destinations the user filters by typing. Example: pressing Cmd+K to jump to any page or run any action." },
  { id: "navigation-menu", label: "Navigation menu", family: "navigation", deep: false, description: "A row of top-level destinations, some of which open a panel of sub-links. Example: a marketing site's top nav with a \"Products\" dropdown." },
  { id: "menubar", label: "Menubar", family: "navigation", deep: false, description: "A desktop-app style row of menus, each opening a list of commands. Example: \"File / Edit / View\" at the top of an app." },

  { id: "alert-dialog", label: "Alert dialog", family: "overlay", deep: true, description: "Interrupting the user to confirm a serious or destructive action with no way to dismiss except choosing, unlike dialog it cannot be casually closed. Example: \"Delete your account? This cannot be undone.\"" },
  { id: "drawer", label: "Drawer", family: "overlay", deep: false, description: "A panel that slides up or in, drag-dismissible, most at home on touch/mobile. Example: a mobile bottom sheet with filter options." },
  { id: "context-menu", label: "Context menu", family: "overlay", deep: false, description: "A menu of actions that appears at the cursor on right-click, not from a visible trigger. Example: right-clicking a file for Rename/Delete." },
  { id: "hover-card", label: "Hover card", family: "overlay", deep: false, description: "A richer preview panel that appears on hover, more content than a tooltip but still not interactive. Example: hovering a username to preview their profile card." },

  { id: "calendar", label: "Calendar", family: "input", deep: false, description: "Picking one date or a range directly from a month grid, when the date itself matters more than typing it. Example: choosing a hotel check-in date." },
];

export const CATALOG_CRITERIA: Record<string, string> = Object.fromEntries(
  CATALOG.map((c) => [c.id, c.description])
);

export const FAMILY_MEMBERS: Record<Family, CatalogEntry[]> = CATALOG.reduce(
  (acc, entry) => {
    acc[entry.family].push(entry);
    return acc;
  },
  { action: [], data_display: [], input: [], navigation: [], feedback: [], overlay: [], layout: [] } as Record<Family, CatalogEntry[]>
);

export const FAMILY_DESCRIPTIONS: Record<Family, string> = {
  action: "A single action the user can take right now, like a button. Example: \"Approve\", \"Save\".",
  data_display: "Showing existing data: a record, a summary, or a list of many records. Example: an invoices table or a customer card.",
  input: "Collecting a value from the user. Example: a text field, a single choice, or a set of toggles.",
  navigation: "Moving between views or through a long list. Example: tabs on a project page, or pages of search results.",
  feedback: "Telling the user about status: a warning, a loading state, or progress. Example: a payment-failed banner.",
  overlay: "Something that appears on top of the page, anchored or blocking. Example: a confirmation dialog or a hover hint.",
  layout: "Structuring or dividing content on the page itself. Example: collapsible FAQ sections.",
};

export function familyOf(componentId: string): Family | undefined {
  return CATALOG.find((c) => c.id === componentId)?.family;
}
