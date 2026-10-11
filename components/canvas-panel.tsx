"use client";

import { useInstinctStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Motion } from "@/lib/style-presets";
import { blockFamilyOf } from "@/lib/blocks";
import type { SidebarBlockProps, AuthBlockProps } from "@/lib/block-adapters";
import { SidebarBlock } from "@/components/blocks/sidebar-block";
import { DashboardBlock, type DashboardBlockProps } from "@/components/blocks/dashboard-block";
import { AuthBlock } from "@/components/blocks/auth-block";
import { ICON_MAP } from "@/lib/icon-map";
import { Sparkles, Copy, Check, type LucideIcon } from "lucide-react";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { decisionToCode } from "@/lib/decision-to-code";
import { Fragment, useState } from "react";

// Entrances only, never scale(0): tw-animate-css's zoom-in-95 already starts at
// a visible 0.95, per Emil Kowalski's "nothing appears from nothing." Ease-out,
// never ease-in: ease-in delays the movement right when the user is watching
// closest. Both stay under 300ms except `expressive`, reserved for the rare,
// worth-noticing reveal (a resolved decision), same band as a modal entrance.
const MOTION_CLASSES: Record<Motion, string> = {
  static: "",
  subtle: "animate-in fade-in duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
  expressive: "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
};
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "@/components/ui/pagination";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { ChevronsUpDownIcon } from "lucide-react";
import { Item, ItemGroup, ItemMedia, ItemContent, ItemTitle, ItemActions } from "@/components/ui/item";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Combobox, ComboboxTrigger, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText, InputGroupButton } from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandList, CommandGroup, CommandItem, CommandInput } from "@/components/ui/command";
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

export function CanvasPanel() {
  const { current, status } = useInstinctStore();
  const decision = current?.decision;
  const Icon = decision ? ICON_MAP[decision.style.icon] ?? Sparkles : null;
  const isBlock = decision?.kind === "block";
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastId, setLastId] = useState(current?.id);
  if (current?.id !== lastId) {
    setLastId(current?.id);
    setShowCode(false);
    setCopied(false);
  }

  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = async () => {
    if (!decision) return;
    try {
      await navigator.clipboard.writeText(decisionToCode(decision));
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2500);
    }
  };

  return (
    <div
      className={cn(
        // Asymmetric on purpose: the floating composer sits over the bottom
        // ~150px, so a true geometric center reads as low. Biasing padding
        // toward the bottom shifts the visible center up to compensate.
        "mx-auto flex min-h-full flex-1 items-center justify-center px-4 pt-6 pb-44 rails:px-0 rails:pt-8 rails:pb-56",
        // Below the rails breakpoint there's nothing to clear (they're bottom
        // sheets instead), so a block gets the whole column up to its own 48rem
        // ceiling. Once the rails are floating it needs a second ceiling for
        // when the window is narrow enough that 48rem would reach under one —
        // min() picks whichever is smaller.
        isBlock ? "w-full max-w-3xl rails:max-w-[min(48rem,calc(100vw-53rem))]" : "w-full max-w-lg"
      )}
    >
      {status === "loading" ? (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="shimmer h-56 w-full rounded-2xl border border-border/60" />
          <Shimmer className="font-mono text-xs uppercase tracking-wider" duration={1.1}>
            Jev is reading the case…
          </Shimmer>
        </div>
      ) : !decision ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Instinct</p>
          <h1 className="text-lg font-medium">Describe the case, not the UI</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Jev picks the exact component in one call, no free text generation.
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-3">
          <p className="truncate font-mono text-xs text-muted-foreground" title={current.text}>
            &ldquo;{current.text}&rdquo;
          </p>
          <div className="flex items-center justify-end gap-3 self-end">
            {showCode && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <span className="relative inline-flex size-3 items-center justify-center">
                  <Copy className={cn("absolute size-3 transition-all duration-150", copied ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-none")} />
                  <Check className={cn("absolute size-3 transition-all duration-150", copied ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-[4px]")} />
                </span>
                <span role="status">{copied ? "Copied to clipboard" : copyFailed ? "Couldn't copy" : "Copy"}</span>
              </button>
            )}
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Code</span>
              <Switch checked={showCode} onCheckedChange={setShowCode} className="scale-90" />
            </label>
          </div>

          {showCode ? (
            <pre className="max-h-[55vh] w-full overflow-auto rounded-2xl border border-border/60 bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-foreground/90 sm:p-4 sm:text-xs rails:max-h-[28rem]">
              {decisionToCode(decision)}
            </pre>
          ) : isBlock ? (
            <div
              key={`${decision.componentId}-${decision.latencyMs.call1}`}
              data-font={decision.style.font}
              data-theme={decision.style.theme}
              data-radius={decision.style.radius}
              className={cn("w-full font-sans", MOTION_CLASSES[decision.style.motion])}
            >
              <BlockRender blockId={decision.componentId} props={decision.props} />
            </div>
          ) : (
            <div
              key={`${decision.componentId}-${decision.latencyMs.call1}`}
              data-font={decision.style.font}
              data-theme={decision.style.theme}
              data-density={decision.style.density}
              data-radius={decision.style.radius}
              data-elevation={decision.style.elevation}
              className={cn(
                "relative w-full rounded-[calc(var(--radius)*1.4)] font-sans",
                MOTION_CLASSES[decision.style.motion]
              )}
              style={{ padding: "var(--canvas-padding, 2rem)", boxShadow: "var(--canvas-shadow, none)" }}
            >
              <Render componentId={decision.componentId} props={decision.props} motion={decision.style.motion} icon={Icon} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BlockRender({ blockId, props }: { blockId: string; props: Record<string, unknown> }) {
  const family = blockFamilyOf(blockId);
  if (family === "authentication") return <AuthBlock props={props as unknown as AuthBlockProps} />;
  if (blockId === "dashboard-01") return <DashboardBlock props={props as unknown as DashboardBlockProps} />;
  return <SidebarBlock props={props as unknown as SidebarBlockProps} />;
}

// Stagger is decorative and reserved for infrequent, worth-noticing moments
// (Emil Kowalski, better-ui): only `expressive` motion staggers list items,
// `subtle`/`static` reveal them together. ~40ms apart, well inside the 30-80ms
// band that reads as sequence without feeling slow.
function stagger(i: number, motion: Motion) {
  if (motion !== "expressive") return {};
  return {
    className: "animate-in fade-in slide-in-from-left-1 duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] fill-mode-backwards",
    style: { animationDelay: `${i * 40}ms` },
  };
}

export function Render({
  componentId,
  props,
  motion,
  icon: Icon,
}: {
  componentId: string;
  props: Record<string, unknown>;
  motion: Motion;
  icon: LucideIcon | null;
}) {
  switch (componentId) {
    case "button":
      return (
        <Button variant={props.variant as never} size={props.size as never}>
          {Icon && <Icon className="size-4" />}
          {props.label as string}
        </Button>
      );

    case "card": {
      const stats = props.stats as { label: string; value: string }[];
      const hero = props.hero as { label: string; value: string } | null;
      const pattern = props.pattern as string;
      const heroTextSize = props.heroTextSize as string;
      const iconTile = Icon && (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[calc(var(--radius)*0.8)] bg-muted text-foreground">
          <Icon className="size-4.5" />
        </div>
      );

      if (pattern === "media-object") {
        return (
          <Card>
            <CardContent className="flex items-center gap-4">
              {Icon && (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-[calc(var(--radius)*0.8)] bg-muted text-foreground">
                  <Icon className="size-6" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <CardTitle>{props.title as string}</CardTitle>
                <CardDescription>{props.description as string}</CardDescription>
              </div>
            </CardContent>
          </Card>
        );
      }

      if (pattern === "hero-stat" && hero) {
        return (
          <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              {iconTile}
              <div className="flex flex-col gap-1">
                <CardTitle>{props.title as string}</CardTitle>
                <CardDescription>{props.description as string}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{hero.label}</span>
                <span className={cn("font-semibold tabular-nums", heroTextSize)}>{hero.value}</span>
              </div>
              {stats.length > 0 && (
                <div className="flex gap-4 border-t border-border pt-3">
                  {stats.map((s) => (
                    <div key={s.label} className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      }

      if (pattern === "list-rows") {
        const rows = hero ? [hero, ...stats] : stats;
        return (
          <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              {iconTile}
              <div className="flex flex-col gap-1">
                <CardTitle>{props.title as string}</CardTitle>
                <CardDescription>{props.description as string}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {rows.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="text-sm font-medium">{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      }

      // equal-grid, the default: every fact carries the same weight.
      const grid = hero ? [hero, ...stats] : stats;
      return (
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            {iconTile}
            <div className="flex flex-col gap-1">
              <CardTitle>{props.title as string}</CardTitle>
              <CardDescription>{props.description as string}</CardDescription>
            </div>
          </CardHeader>
          {grid.length > 0 && (
            <CardContent className="grid grid-cols-2 gap-3">
              {grid.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5 rounded-[calc(var(--radius)*0.8)] border border-border p-2.5">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-sm font-medium">{s.value}</span>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      );
    }

    case "table": {
      const columns = props.columns as string[];
      const rows = props.rows as string[][];
      return (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c}>{c}</TableHead>
              ))}
              {Boolean(props.withActions) && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} {...stagger(i, motion)}>
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
                {Boolean(props.withActions) && (
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">Edit</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
          {typeof props.caption === "string" && <TableCaption>{props.caption}</TableCaption>}
        </Table>
      );
    }

    case "select":
      return (
        <Select defaultValue={undefined}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={props.placeholder as string} />
          </SelectTrigger>
          <SelectContent>
            {(props.options as string[]).map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "tabs": {
      const tabs = props.tabs as string[];
      return (
        <Tabs defaultValue={tabs[0]}>
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t} value={t} className="pt-3 text-muted-foreground">
              {props.entity as string} — {t}
            </TabsContent>
          ))}
        </Tabs>
      );
    }

    case "alert":
      return (
        <Alert variant={props.variant as never}>
          {Icon && <Icon />}
          <AlertTitle>{props.title as string}</AlertTitle>
          <AlertDescription>{props.description as string}</AlertDescription>
        </Alert>
      );

    case "dialog":
      return (
        <Dialog>
          <DialogTrigger render={<Button variant={props.destructive ? "destructive" : "default"} />}>
            {Icon && <Icon className="size-4" />}
            {props.title as string}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {Icon && <Icon className="size-4" />}
                {props.title as string}
              </DialogTitle>
              <DialogDescription>{props.description as string}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button variant={props.destructive ? "destructive" : "default"}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

    case "accordion": {
      const items = props.items as { title: string; content: string }[];
      return (
        <Accordion multiple={Boolean(props.multiple)}>
          {items.map((item, i) => (
            <AccordionItem key={item.title} value={i} {...stagger(i, motion)}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }

    case "badge":
      return <Badge variant={props.variant as never}>{props.label as string}</Badge>;

    case "avatar":
      return (
        <Avatar>
          <AvatarFallback>{props.initials as string}</AvatarFallback>
        </Avatar>
      );

    case "input":
      return <Input placeholder={props.placeholder as string} />;

    case "checkbox":
      return (
        <div className="flex flex-col gap-2.5">
          {(props.items as string[]).map((item, i) => (
            <label key={item} className="flex items-center gap-2 text-sm" {...stagger(i, motion)}>
              <Checkbox /> {item}
            </label>
          ))}
        </div>
      );

    case "switch":
      return (
        <div className="flex flex-col gap-3">
          {(props.items as string[]).map((item, i) => (
            <label key={item} className="flex items-center justify-between gap-2 text-sm" {...stagger(i, motion)}>
              {item} <Switch />
            </label>
          ))}
        </div>
      );

    case "textarea":
      return <Textarea defaultValue={props.value as string} placeholder={props.placeholder as string} rows={4} />;

    case "breadcrumb": {
      const crumbs = props.crumbs as string[];
      return (
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((c, i) => (
              <span key={c} className="flex items-center gap-1.5">
                <BreadcrumbItem>
                  {i === crumbs.length - 1 ? (
                    <BreadcrumbPage>{c}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href="#">{c}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {i < crumbs.length - 1 && <BreadcrumbSeparator />}
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      );
    }

    case "pagination": {
      const count = props.pageCount as number;
      return (
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            {Array.from({ length: count }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={i === 0}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      );
    }

    case "progress":
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{props.label as string}</p>
          <Progress value={props.value as number} />
        </div>
      );

    case "skeleton":
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: props.lines as number }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      );

    case "sheet":
      return (
        <Sheet>
          <SheetTrigger render={<Button />}>{props.trigger as string}</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{props.title as string}</SheetTitle>
              <SheetDescription>{props.description as string}</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

    case "popover":
      return (
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>{props.trigger as string}</PopoverTrigger>
          <PopoverContent>{props.content as string}</PopoverContent>
        </Popover>
      );

    case "tooltip":
      return (
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>{props.trigger as string}</TooltipTrigger>
          <TooltipContent>{props.content as string}</TooltipContent>
        </Tooltip>
      );

    case "dropdown-menu":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>{props.trigger as string}</DropdownMenuTrigger>
          <DropdownMenuContent>
            {(props.items as string[]).map((item) => (
              <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "separator":
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{props.label as string}</p>
          <Separator />
        </div>
      );

    case "button-group":
      return (
        <ButtonGroup>
          {(props.actions as string[]).map((a) => (
            <Button key={a} variant={props.variant as never}>{a}</Button>
          ))}
        </ButtonGroup>
      );

    case "carousel": {
      const items = props.items as string[];
      return (
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem key={item}>
                <div className="flex aspect-square items-center justify-center rounded-lg border border-border text-sm text-muted-foreground">
                  {item}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      );
    }

    case "chart": {
      const data = props.data as { label: string; value: number }[];
      const chartType = props.chartType as string;
      const config = { value: { label: props.label as string, color: "var(--primary)" } } satisfies ChartConfig;

      if (chartType === "pie" || chartType === "donut") {
        return (
          <ChartContainer config={config} className="!aspect-auto h-[220px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={chartType === "donut" ? "55%" : 0}
                outerRadius="85%"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill="var(--primary)" style={{ opacity: 1 - i * 0.18 }} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        );
      }

      if (chartType === "line") {
        return (
          <ChartContainer config={config} className="!aspect-auto h-[220px] w-full">
            <LineChart data={data} margin={{ top: 10 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, "auto"]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        );
      }

      if (chartType === "area") {
        return (
          <ChartContainer config={config} className="!aspect-auto h-[220px] w-full">
            <AreaChart data={data} margin={{ top: 10 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, "auto"]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.25} strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        );
      }

      return (
        <ChartContainer config={config} className="!aspect-auto h-[220px] w-full">
          <BarChart data={data} margin={{ top: 10 }}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis hide domain={[0, "auto"]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" />
          </BarChart>
        </ChartContainer>
      );
    }

    case "item": {
      const items = props.items as string[];
      const withActions = Boolean(props.withActions);
      return (
        <ItemGroup>
          {items.map((item, i) => (
            <Item key={item} variant="outline" {...stagger(i, motion)}>
              <ItemMedia>
                <Avatar><AvatarFallback>{item.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item}</ItemTitle>
              </ItemContent>
              {withActions && (
                <ItemActions>
                  <Button size="sm" variant="ghost">View</Button>
                </ItemActions>
              )}
            </Item>
          ))}
        </ItemGroup>
      );
    }

    case "empty":
      return (
        <Empty>
          <EmptyHeader>
            {Icon && (
              <EmptyMedia variant="icon">
                <Icon />
              </EmptyMedia>
            )}
            <EmptyTitle>{props.title as string}</EmptyTitle>
            <EmptyDescription>{props.description as string}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      );

    case "aspect-ratio":
      return (
        <AspectRatio ratio={16 / 9} className="flex items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
          {props.label as string}
        </AspectRatio>
      );

    case "combobox": {
      const options = props.options as string[];
      return (
        <Combobox items={options}>
          <InputGroup>
            <ComboboxInput placeholder={props.placeholder as string} render={<InputGroupInput />} />
            <InputGroupAddon align="inline-end">
              <ComboboxTrigger render={<InputGroupButton size="icon-xs" />}>
                <ChevronsUpDownIcon className="size-4" />
              </ComboboxTrigger>
            </InputGroupAddon>
          </InputGroup>
          <ComboboxContent>
            <ComboboxList>
              {options.map((o) => (
                <ComboboxItem key={o} value={o}>{o}</ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      );
    }

    case "radio-group": {
      const options = props.options as string[];
      return (
        <RadioGroup defaultValue={options[0]}>
          {options.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={o} /> {o}
            </label>
          ))}
        </RadioGroup>
      );
    }

    case "slider":
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{props.label as string}</p>
          <Slider defaultValue={[50]} max={100} step={1} />
        </div>
      );

    case "toggle":
      return <Toggle aria-label={props.label as string}>{props.label as string}</Toggle>;

    case "toggle-group":
      return (
        <ToggleGroup>
          {(props.options as string[]).map((o) => (
            <ToggleGroupItem key={o} value={o}>{o}</ToggleGroupItem>
          ))}
        </ToggleGroup>
      );

    case "input-group":
      return (
        <InputGroup>
          {props.prefix ? <InputGroupAddon><InputGroupText>{props.prefix as string}</InputGroupText></InputGroupAddon> : null}
          <InputGroupInput placeholder={props.placeholder as string} />
        </InputGroup>
      );

    case "input-otp":
      return (
        <InputOTP maxLength={props.length as number}>
          <InputOTPGroup>
            {Array.from({ length: props.length as number }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      );

    case "field":
      return (
        <Field>
          <FieldLabel>{props.label as string}</FieldLabel>
          <Input />
          <FieldDescription>{props.description as string}</FieldDescription>
        </Field>
      );

    case "calendar":
      return <Calendar mode="single" className="rounded-lg border border-border" />;

    case "command": {
      const items = props.items as string[];
      return (
        <Command className="rounded-lg border border-border">
          <CommandInput placeholder="Type a command..." />
          <CommandList>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem key={item}>{item}</CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      );
    }

    case "navigation-menu":
      return (
        <NavigationMenu>
          <NavigationMenuList>
            {(props.items as string[]).map((item) => (
              <NavigationMenuItem key={item}>
                <NavigationMenuLink href="#">{item}</NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      );

    case "menubar":
      return (
        <Menubar>
          {(props.menus as string[]).map((menu) => (
            <MenubarMenu key={menu}>
              <MenubarTrigger>{menu}</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New</MenubarItem>
                <MenubarItem>Open</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          ))}
        </Menubar>
      );

    case "alert-dialog":
      return (
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant={props.destructive ? "destructive" : "default"} />}>
            {Icon && <Icon className="size-4" />}
            {props.title as string}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {Icon && <Icon className="size-4" />}
                {props.title as string}
              </AlertDialogTitle>
              <AlertDialogDescription>{props.description as string}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction render={<Button variant={props.destructive ? "destructive" : "default"} />}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

    case "drawer":
      return (
        <Drawer>
          <DrawerTrigger render={<Button />}>{props.trigger as string}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{props.title as string}</DrawerTitle>
              <DrawerDescription>{props.description as string}</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

    case "context-menu":
      return (
        <ContextMenu>
          <ContextMenuTrigger className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            Right-click {props.trigger as string}
          </ContextMenuTrigger>
          <ContextMenuContent>
            {(props.items as string[]).map((item) => (
              <ContextMenuItem key={item}>{item}</ContextMenuItem>
            ))}
          </ContextMenuContent>
        </ContextMenu>
      );

    case "hover-card":
      return (
        <HoverCard>
          <HoverCardTrigger render={<Button variant="outline" />}>{props.trigger as string}</HoverCardTrigger>
          <HoverCardContent>{props.content as string}</HoverCardContent>
        </HoverCard>
      );

    case "collapsible":
      return (
        <Collapsible className="w-full">
          <CollapsibleTrigger render={<Button variant="outline" className="w-full justify-between" />}>
            {props.label as string}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
            {props.content as string}
          </CollapsibleContent>
        </Collapsible>
      );

    case "scroll-area":
      return (
        <ScrollArea className="h-32 w-full rounded-lg border border-border p-3">
          <div className="flex flex-col gap-2 text-sm">
            {(props.items as string[]).map((item) => <p key={item}>{item}</p>)}
          </div>
        </ScrollArea>
      );

    case "resizable": {
      const panels = props.panels as string[];
      return (
        <ResizablePanelGroup orientation="horizontal" className="h-32 rounded-lg border border-border">
          {panels.map((panel, i) => (
            <Fragment key={panel}>
              {i > 0 && <ResizableHandle />}
              <ResizablePanel className="flex items-center justify-center text-sm text-muted-foreground">
                {panel}
              </ResizablePanel>
            </Fragment>
          ))}
        </ResizablePanelGroup>
      );
    }

    default:
      return <p className="text-sm text-muted-foreground">{componentId}</p>;
  }
}
