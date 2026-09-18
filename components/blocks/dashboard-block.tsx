"use client";

import type { SidebarBlockProps } from "@/lib/block-adapters";
import { SidebarBlockShell } from "./sidebar-block";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

export interface DashboardBlockProps {
  sidebar: SidebarBlockProps;
  stats: { label: string; value: string }[];
  columns: string[];
  rows: string[][];
}

/**
 * Real composition, not new chart or table code: the same shadcn Card,
 * Table, and Chart primitives already built for the atomic path, arranged
 * as dashboard-01 actually arranges them (stat row, then chart and table).
 */
export function DashboardBlock({ props }: { props: DashboardBlockProps }) {
  const chartData = props.rows.slice(0, 6).map((row, i) => ({ label: `#${i + 1}`, value: Number(row[0]?.replace(/[^0-9.]/g, "")) || 20 + i * 8 }));
  const config = { value: { label: props.columns[0] ?? "Value", color: "var(--primary)" } } satisfies ChartConfig;

  return (
    <SidebarBlockShell props={props.sidebar}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Stacked on a phone, so each stat gets the full column width: at
              the desktop card spacing three of these would be ~250px tall each
              and push the chart and table out of the block entirely. */}
          {props.stats.map((s) => (
            <Card key={s.label} className="gap-1 py-3 sm:gap-(--card-spacing) sm:py-(--card-spacing)">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-normal text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-lg font-semibold tabular-nums sm:text-xl">{s.value}</CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-4">
            <ChartContainer config={config} className="!aspect-auto h-[160px] w-full">
              <BarChart data={chartData} margin={{ top: 10 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, "auto"]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={3} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {props.columns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </SidebarBlockShell>
  );
}
