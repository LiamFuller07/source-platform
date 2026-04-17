"use client";

import * as React from "react";
import {
  Check,
  Loader2,
  Circle,
  Globe,
  FileText,
  FileSpreadsheet,
  Database,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ————————————————————————————————————————————————————————————————
// Types
// ————————————————————————————————————————————————————————————————

export type TodoStatus =
  | "completed"
  | "in_progress"
  | "awaiting_response"
  | "pending";

export type ToolKind = "web" | "doc" | "sheet" | "db";

export type ToolChip = {
  kind: ToolKind;
  label: string;
};

export type Todo = {
  id: string;
  label: string;
  status: TodoStatus;
  tool?: ToolChip;
};

export type PlanProps = {
  id?: string;
  title?: string;
  description?: string;
  todos: Todo[];
  className?: string;
};

// ————————————————————————————————————————————————————————————————
// Plan (live-reasoning list)
// ————————————————————————————————————————————————————————————————

export function Plan({ title, description, todos, className }: PlanProps) {
  const hasHeader = title || description;
  
  return (
    <div
      className={cn(
        hasHeader && "bg-white rounded-xl border border-black/[0.07] shadow-[0_1px_2px_rgba(15,14,13,0.03)]",
        "overflow-hidden",
        className,
      )}
    >
      {hasHeader && (
        <div className="px-5 pt-4 pb-3 border-b border-black/[0.05]">
          {title && (
            <div className="text-[12.5px] font-semibold text-[#0f0e0d] tracking-[-0.005em]">
              {title}
            </div>
          )}
          {description && (
            <div className="mt-0.5 text-[11.5px] text-[#0f0e0d]/55 leading-snug">
              {description}
            </div>
          )}
        </div>
      )}
      <ul className={cn("divide-y", hasHeader ? "divide-black/[0.04]" : "space-y-3")}>
        {todos.map((t) => (
          <li
            key={t.id}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3",
              hasHeader ? "px-5 py-2.5" : "py-2"
            )}
          >
            <span
              className={cn(
                "text-[13.5px] truncate",
                t.status === "pending"
                  ? "text-[#0f0e0d]/55"
                  : "text-[#0f0e0d]",
              )}
            >
              {t.label}
            </span>
            <StatusPill status={t.status} />
            <ToolPill tool={t.tool} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Status pill
// ————————————————————————————————————————————————————————————————

function StatusPill({ status }: { status: TodoStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6efe4] text-[#2f5d3a] px-2.5 h-6 text-[11.5px] font-medium">
        <Check className="w-3 h-3" strokeWidth={2.5} />
        Completed
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf4e3] text-[#8a5a12] px-2.5 h-6 text-[11.5px] font-medium">
        <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2.25} />
        In progress
      </span>
    );
  }
  if (status === "awaiting_response") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7e9cc] text-[#8a5a12] px-2.5 h-6 text-[11.5px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#c78a36]" />
        Awaiting response
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1efeb] text-[#0f0e0d]/55 px-2.5 h-6 text-[11.5px] font-medium">
      <Circle className="w-3 h-3" strokeWidth={2} />
      Pending
    </span>
  );
}

// ————————————————————————————————————————————————————————————————
// Tool pill (right side chip)
// ————————————————————————————————————————————————————————————————

const TOOL_ICONS: Record<ToolKind, { icon: LucideIcon; color: string }> = {
  web: { icon: Globe, color: "#0f0e0d" },
  doc: { icon: FileText, color: "#2a5bb8" },
  sheet: { icon: FileSpreadsheet, color: "#1f7a3f" },
  db: { icon: Database, color: "#0f0e0d" },
};

function ToolPill({ tool }: { tool?: ToolChip }) {
  if (!tool) {
    return <span className="w-0" />;
  }
  const { icon: Icon, color } = TOOL_ICONS[tool.kind];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 h-6 text-[11.5px] text-[#0f0e0d] max-w-[180px]">
      <Icon
        className="w-3 h-3 flex-shrink-0"
        strokeWidth={2}
        style={{ color }}
      />
      <span className="truncate">{tool.label}</span>
    </span>
  );
}
