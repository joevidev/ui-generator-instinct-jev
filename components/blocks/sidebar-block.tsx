"use client";

import type { SidebarBlockProps } from "@/lib/block-adapters";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, ChevronDown, type LucideIcon } from "lucide-react";

function MenuItem({ label, menuStyle, Icon }: { label: string; menuStyle: SidebarBlockProps["menuStyle"]; Icon: LucideIcon }) {
  const subItems = ["Overview", "Details"];

  if (menuStyle === "submenu") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Icon /> <span>{label}</span>
        </SidebarMenuButton>
        <SidebarMenuSub>
          {subItems.map((s) => (
            <SidebarMenuSubItem key={s}>
              <SidebarMenuSubButton href="#">{s}</SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </SidebarMenuItem>
    );
  }

  if (menuStyle === "dropdown") {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton />}>
            <Icon /> <span>{label}</span> <ChevronDown className="ml-auto size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            {subItems.map((s) => (
              <DropdownMenuItem key={s}>{s}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={label}>
        <Icon /> <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function SidebarBlockShell({
  props,
  children,
}: {
  props: SidebarBlockProps;
  children?: React.ReactNode;
}) {
  const { variant, collapsible, menuStyle, orgName, items } = props;
  const nav = items.slice(0, 5);

  const sidebar = (
    <Sidebar variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="size-6 rounded-md">
                <AvatarFallback className="rounded-md text-[10px]">{orgName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{orgName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menuStyle === "collapsible" ? (
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <CollapsibleTrigger render={<SidebarGroupLabel className="cursor-pointer" />}>
                Navigation
                <ChevronDown className="ml-auto size-3.5 transition-transform group-data-[panel-open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {nav.map((label) => (
                      <MenuItem key={label} label={label} menuStyle="grouped" Icon={Home} />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((label) => (
                  <MenuItem key={label} label={label} menuStyle={menuStyle} Icon={Home} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Avatar className="size-6"><AvatarFallback className="text-[10px]">U</AvatarFallback></Avatar>
              <span>User</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <SidebarProvider className="min-h-[420px] [&_[data-slot=sidebar-container]]:!absolute [&_[data-slot=sidebar-container]]:!h-full">
      <div className="relative flex h-[420px] w-full overflow-hidden rounded-[calc(var(--radius)*1.2)] border border-border">
        {sidebar}
        <SidebarInset className="flex-1 overflow-auto">
          <header className="flex h-12 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <span className="text-sm font-medium">{orgName}</span>
          </header>
          <div className="p-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export function SidebarBlock({ props }: { props: SidebarBlockProps }) {
  return (
    <SidebarBlockShell props={props}>
      <p className="text-sm text-muted-foreground">Sidebar content goes here.</p>
    </SidebarBlockShell>
  );
}
