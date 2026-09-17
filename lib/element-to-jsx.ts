// Serializes an actual React element tree into real, copy-pasteable JSX —
// not a hand-duplicated template per catalog case (that drifts from
// components/canvas-panel.tsx's Render/BlockRender the moment either changes).
// The source map below re-imports the exact same bindings Render already
// uses, so the import path attached to each tag can never go stale.
import type { ReactElement, ReactNode } from "react";
import { Children, Fragment, isValidElement } from "react";
import { ICON_MAP } from "./icon-map";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableCaption } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonGroup } from "@/components/ui/button-group";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { Item, ItemGroup, ItemMedia, ItemContent, ItemTitle, ItemActions } from "@/components/ui/item";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Combobox, ComboboxTrigger, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandList, CommandGroup, CommandItem, CommandInput, CommandEmpty, CommandSeparator } from "@/components/ui/command";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { SidebarBlock } from "@/components/blocks/sidebar-block";
import { DashboardBlock } from "@/components/blocks/dashboard-block";
import { AuthBlock } from "@/components/blocks/auth-block";

interface Registered {
  name: string;
  source: string;
}

const SOURCE_MAP = new Map<unknown, Registered>();

// Keyed by the exact local binding used above, so the generated import
// statement can never name something different from the JSX tag it goes
// with — unlike deriving the tag from the component's own runtime .name,
// which is wrong the moment a library (recharts) doesn't set it to match
// its own export name (its Tooltip's .name is "Tooltip", but chart.tsx
// re-exports it as ChartTooltip; the runtime name alone would mislabel it).
function registerAll(source: string, members: Record<string, unknown>) {
  for (const [name, ref] of Object.entries(members)) {
    SOURCE_MAP.set(ref, { name, source });
  }
}

registerAll("@/components/ui/button", { Button });
registerAll("@/components/ui/card", { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction });
registerAll("@/components/ui/badge", { Badge });
registerAll("@/components/ui/avatar", { Avatar, AvatarFallback, AvatarImage });
registerAll("@/components/ui/input", { Input });
registerAll("@/components/ui/checkbox", { Checkbox });
registerAll("@/components/ui/switch", { Switch });
registerAll("@/components/ui/textarea", { Textarea });
registerAll("@/components/ui/tabs", { Tabs, TabsList, TabsTrigger, TabsContent });
registerAll("@/components/ui/breadcrumb", { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator });
registerAll("@/components/ui/pagination", { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis });
registerAll("@/components/ui/alert", { Alert, AlertTitle, AlertDescription });
registerAll("@/components/ui/progress", { Progress });
registerAll("@/components/ui/skeleton", { Skeleton });
registerAll("@/components/ui/dialog", { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose });
registerAll("@/components/ui/sheet", { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter });
registerAll("@/components/ui/popover", { Popover, PopoverTrigger, PopoverContent });
registerAll("@/components/ui/tooltip", { Tooltip, TooltipTrigger, TooltipContent });
registerAll("@/components/ui/dropdown-menu", { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem });
registerAll("@/components/ui/accordion", { Accordion, AccordionItem, AccordionTrigger, AccordionContent });
registerAll("@/components/ui/separator", { Separator });
registerAll("@/components/ui/table", { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableCaption });
registerAll("@/components/ui/select", { Select, SelectContent, SelectItem, SelectTrigger, SelectValue });
registerAll("@/components/ui/button-group", { ButtonGroup });
registerAll("@/components/ui/carousel", { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext });
registerAll("@/components/ui/chart", { ChartContainer, ChartTooltip, ChartTooltipContent });
registerAll("recharts", { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area });
registerAll("@/components/ui/item", { Item, ItemGroup, ItemMedia, ItemContent, ItemTitle, ItemActions });
registerAll("@/components/ui/empty", { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia });
registerAll("@/components/ui/aspect-ratio", { AspectRatio });
registerAll("@/components/ui/combobox", { Combobox, ComboboxTrigger, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem });
registerAll("@/components/ui/radio-group", { RadioGroup, RadioGroupItem });
registerAll("@/components/ui/slider", { Slider });
registerAll("@/components/ui/toggle", { Toggle });
registerAll("@/components/ui/toggle-group", { ToggleGroup, ToggleGroupItem });
registerAll("@/components/ui/input-group", { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText, InputGroupButton, InputGroupTextarea });
registerAll("@/components/ui/input-otp", { InputOTP, InputOTPGroup, InputOTPSlot });
registerAll("@/components/ui/field", { Field, FieldLabel, FieldDescription });
registerAll("@/components/ui/calendar", { Calendar });
registerAll("@/components/ui/command", { Command, CommandList, CommandGroup, CommandItem, CommandInput, CommandEmpty, CommandSeparator });
registerAll("@/components/ui/navigation-menu", { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink });
registerAll("@/components/ui/menubar", { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem });
registerAll("@/components/ui/alert-dialog", {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
});
registerAll("@/components/ui/drawer", { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription });
registerAll("@/components/ui/context-menu", { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem });
registerAll("@/components/ui/hover-card", { HoverCard, HoverCardTrigger, HoverCardContent });
registerAll("@/components/ui/collapsible", { Collapsible, CollapsibleTrigger, CollapsibleContent });
registerAll("@/components/ui/scroll-area", { ScrollArea });
registerAll("@/components/ui/resizable", { ResizablePanelGroup, ResizablePanel, ResizableHandle });
registerAll("@/components/blocks/sidebar-block", { SidebarBlock });
registerAll("@/components/blocks/dashboard-block", { DashboardBlock });
registerAll("@/components/blocks/auth-block", { AuthBlock });

const INDENT = "  ";

function intrinsicName(type: unknown): string {
  if (typeof type === "string") return type;
  if (typeof type === "function") {
    const f = type as { displayName?: string; name?: string };
    return f.displayName || f.name || "Component";
  }
  if (type && typeof type === "object") {
    const t = type as { displayName?: string; render?: unknown; type?: unknown };
    if (t.displayName) return t.displayName;
    if (t.render) return intrinsicName(t.render);
    if (t.type) return intrinsicName(t.type);
  }
  return "Component";
}

function resolveTag(type: unknown): { tag: string; source?: string } {
  if (typeof type === "string") return { tag: type };
  const registered =
    SOURCE_MAP.get(type) ??
    (type && typeof type === "object" ? SOURCE_MAP.get((type as { render?: unknown }).render) : undefined);
  if (registered) return { tag: registered.name, source: registered.source };
  const name = intrinsicName(type);
  if (name in ICON_MAP) return { tag: name, source: "lucide-react" };
  return { tag: name };
}

interface Ctx {
  imports: Map<string, Set<string>>;
}

function recordImport(ctx: Ctx, tag: string, source: string | undefined) {
  if (!source) return;
  if (!ctx.imports.has(source)) ctx.imports.set(source, new Set());
  ctx.imports.get(source)!.add(tag);
}

function serializeAttrValue(value: unknown, indent: string, ctx: Ctx): string {
  if (isValidElement(value)) return serializeElement(value, indent, ctx);
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return String(value);
  if (typeof value === "function") return "() => {}";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const inner = indent + INDENT;
    const items = value.map((v) => `${inner}${serializeAttrValue(v, inner, ctx)}`);
    return `[\n${items.join(",\n")}\n${indent}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const inner = indent + INDENT;
    const lines = entries.map(([k, v]) => `${inner}${JSON.stringify(k)}: ${serializeAttrValue(v, inner, ctx)}`);
    return `{\n${lines.join(",\n")}\n${indent}}`;
  }
  return String(value);
}

function serializeAttr(key: string, value: unknown, indent: string, ctx: Ctx): string {
  if (value === true) return key;
  if (typeof value === "string") return `${key}=${JSON.stringify(value)}`;
  return `${key}={${serializeAttrValue(value, indent, ctx)}}`;
}

function serializeElement(el: ReactElement, indent: string, ctx: Ctx): string {
  const type = (el as unknown as { type: unknown }).type;

  if (type === Fragment) {
    const kids = serializeChildren((el.props as { children?: ReactNode }).children, indent + INDENT, ctx);
    return kids ? `<>\n${kids}\n${indent}</>` : "<></>";
  }

  const { tag, source } = resolveTag(type);
  recordImport(ctx, tag, source);
  const props = (el.props ?? {}) as Record<string, unknown>;
  const { children, ...rest } = props;
  const attrs = Object.entries(rest).filter(([, v]) => v !== undefined);
  const attrIndent = indent + INDENT;
  const kids = serializeChildren(children as ReactNode, attrIndent, ctx);

  if (attrs.length === 0) {
    return kids ? `<${tag}>\n${kids}\n${indent}</${tag}>` : `<${tag} />`;
  }

  const attrLines = attrs.map(([k, v]) => `${attrIndent}${serializeAttr(k, v, attrIndent, ctx)}`);
  const openTag = `<${tag}\n${attrLines.join("\n")}\n${indent}`;
  return kids ? `${openTag}>\n${kids}\n${indent}</${tag}>` : `${openTag}/>`;
}

function serializeChildren(children: ReactNode, indent: string, ctx: Ctx): string {
  const arr = Children.toArray(children);
  const lines = arr
    .map((child) => {
      if (isValidElement(child)) return `${indent}${serializeElement(child, indent, ctx)}`;
      if (typeof child === "boolean" || child == null) return null;
      if (typeof child === "string" || typeof child === "number") return `${indent}${child}`;
      return `${indent}{${serializeAttrValue(child, indent, ctx)}}`;
    })
    .filter((l): l is string => l !== null);
  return lines.join("\n");
}

export function elementToCode(el: ReactElement): string {
  const ctx: Ctx = { imports: new Map() };
  const body = serializeElement(el, "", ctx);
  const importLines = Array.from(ctx.imports.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([source, tags]) => `import { ${Array.from(tags).sort().join(", ")} } from "${source}";`);
  return [...importLines, "", body].join("\n");
}
