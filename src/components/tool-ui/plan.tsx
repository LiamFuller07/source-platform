"use client";

import * as React from "react";
import {
  Check,
  Loader2,
  Circle,
  X as XIcon,
  ChevronDown,
  Globe,
  FileText,
  FileSpreadsheet,
  Database,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/* ────────────────────────────────────────────────────────────────
 * @tool-ui/plan — schema
 * ────────────────────────────────────────────────────────────── */

export type PlanTodoStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  /** Extension used by the pipeline dashboard. */
  | "awaiting_response";

/** @deprecated Use {@link PlanTodoStatus}. Kept as a back-compat alias. */
export type TodoStatus = PlanTodoStatus;

export type ToolKind = "web" | "doc" | "sheet" | "db";

export type ToolChip = {
  kind: ToolKind;
  label: string;
};

export interface PlanTodo {
  id: string;
  label: string;
  status: PlanTodoStatus;
  description?: string;
  /** Optional tool chip rendered on the right of the row. */
  tool?: ToolChip;
}

/** @deprecated Use {@link PlanTodo}. */
export type Todo = PlanTodo;

export interface PlanProps {
  id?: string;
  title?: string;
  description?: string;
  todos: PlanTodo[];
  maxVisibleTodos?: number;
  className?: string;
}

/* ────────────────────────────────────────────────────────────────
 * Progress helpers (mirrors @tool-ui/plan/progress)
 * ────────────────────────────────────────────────────────────── */

function calculatePlanProgress(completed: number, total: number) {
  if (total <= 0) return 0;
  const v = (completed / total) * 100;
  return Math.max(0, Math.min(100, v));
}

/* ────────────────────────────────────────────────────────────────
 * Status pill
 * ────────────────────────────────────────────────────────────── */

function StatusPill({ status }: { status: PlanTodoStatus }) {
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
        <Loader2 className="w-3 h-3 motion-safe:animate-spin" strokeWidth={2.25} />
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
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] text-[#0f0e0d]/55 px-2.5 h-6 text-[11.5px] font-medium">
        <XIcon className="w-3 h-3" strokeWidth={2.5} />
        Cancelled
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

/* ────────────────────────────────────────────────────────────────
 * Tool chip (right side)
 * ────────────────────────────────────────────────────────────── */

const TOOL_ICONS: Record<ToolKind, { icon: LucideIcon; color: string }> = {
  web: { icon: Globe, color: "#0f0e0d" },
  doc: { icon: FileText, color: "#2a5bb8" },
  sheet: { icon: FileSpreadsheet, color: "#1f7a3f" },
  db: { icon: Database, color: "#5e5e5e" },
};

function ToolPill({ tool }: { tool?: ToolChip }) {
  if (!tool) return null;
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

/* ────────────────────────────────────────────────────────────────
 * Single todo row
 * ────────────────────────────────────────────────────────────── */

function TodoRow({
  todo,
  withPadding,
}: {
  todo: PlanTodo;
  withPadding: boolean;
}) {
  const labelClass = cn(
    "text-[13.5px] truncate tracking-[-0.005em]",
    todo.status === "pending" && "text-[#0f0e0d]/55",
    todo.status === "cancelled" && "text-[#0f0e0d]/45 line-through",
    (todo.status === "completed" ||
      todo.status === "in_progress" ||
      todo.status === "awaiting_response") &&
      "text-[#0f0e0d]",
  );

  const right = (
    <div className="flex items-center gap-2 shrink-0">
      <StatusPill status={todo.status} />
      {todo.tool ? <ToolPill tool={todo.tool} /> : null}
    </div>
  );

  if (!todo.description) {
    return (
      <li
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
          withPadding ? "px-5 py-2.5" : "py-2",
        )}
      >
        <span className={labelClass}>{todo.label}</span>
        {right}
      </li>
    );
  }

  return (
    <li className={cn(withPadding ? "px-5 py-2.5" : "py-2")}>
      <Collapsible>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group/trigger flex items-center gap-1.5 min-w-0 text-left"
            >
              <span className={labelClass}>{todo.label}</span>
              <ChevronDown
                className="w-3 h-3 text-[#0f0e0d]/35 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180"
                strokeWidth={2}
              />
            </button>
          </CollapsibleTrigger>
          {right}
        </div>
        <CollapsibleContent className="pt-1.5 text-[12px] leading-relaxed text-[#0f0e0d]/60">
          {todo.description}
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Plan root
 * ────────────────────────────────────────────────────────────── */

interface PlanRootProps extends PlanProps {
  compact?: boolean;
}

function PlanRoot({
  id,
  title,
  description,
  todos,
  maxVisibleTodos,
  className,
  compact = false,
}: PlanRootProps) {
  const completedCount = todos.filter((t) => t.status === "completed").length;
  const totalCount = todos.length;
  const progress = calculatePlanProgress(completedCount, totalCount);
  const isComplete = progress === 100 && totalCount > 0;

  const [expanded, setExpanded] = React.useState(false);
  const showAll =
    expanded || !maxVisibleTodos || todos.length <= maxVisibleTodos;
  const visibleTodos = showAll ? todos : todos.slice(0, maxVisibleTodos);
  const hiddenCount = todos.length - visibleTodos.length;

  const hasHeader = Boolean(title || description) && !compact;
  const withRowPadding = hasHeader; // boxed variant gets its own row padding

  return (
    <div
      data-tool-ui-id={id}
      data-slot="plan"
      className={cn(
        hasHeader &&
          "bg-white rounded-xl border border-black/[0.07] shadow-[0_1px_2px_rgba(15,14,13,0.03)]",
        "overflow-hidden",
        className,
      )}
    >
      {hasHeader && (
        <div className="px-5 pt-4 pb-3 border-b border-black/[0.05]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
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
            <div
              className={cn(
                "shrink-0 text-[11px] uppercase tracking-[0.1em] font-medium tabular-nums",
                isComplete ? "text-[#2f5d3a]" : "text-[#0f0e0d]/50",
              )}
            >
              {completedCount} / {totalCount}
            </div>
          </div>
          <div className="mt-3 h-[3px] w-full rounded-full bg-black/[0.06] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                isComplete ? "bg-[#2f5d3a]" : "bg-[#0f0e0d]",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <ul
        className={cn(
          hasHeader && "divide-y divide-black/[0.04]",
          !hasHeader && "space-y-0",
        )}
      >
        {visibleTodos.map((t) => (
          <TodoRow key={t.id} todo={t} withPadding={withRowPadding} />
        ))}
      </ul>

      {hiddenCount > 0 && (
        <div
          className={cn(
            hasHeader ? "px-5 py-2.5 border-t border-black/[0.05]" : "pt-2",
          )}
        >
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-[11.5px] text-[#0f0e0d]/55 hover:text-[#0f0e0d] transition-colors"
          >
            Show {hiddenCount} more
          </button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Public API
 * ────────────────────────────────────────────────────────────── */

/**
 * Plan — step-by-step task workflow display.
 *
 * Matches the public API of `@tool-ui/plan`:
 *   <Plan id="…" title="…" description="…" todos={[…]} maxVisibleTodos={…} />
 *
 * Extensions:
 *   - `awaiting_response` status for external client dependencies
 *   - `tool` chip on a todo for the executing tool (Web / docx / sheet / db)
 */
function PlanImpl(props: PlanProps) {
  return <PlanRoot {...props} />;
}

/**
 * Plan.Compact — steps-only body:
 * - No title/description header
 * - No progress bar or summary
 * - No outer card chrome; parent controls framing
 */
export function PlanCompact(props: PlanProps) {
  return <PlanRoot {...props} compact />;
}

export const Plan = Object.assign(PlanImpl, { Compact: PlanCompact });

export type { PlanProps as SerializablePlan };
