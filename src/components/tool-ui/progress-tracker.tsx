"use client";

import * as React from "react";
import { Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ————————————————————————————————————————————————————————————————
// Ported source from the official registry: `@tool-ui/progress-tracker`
// (`npx shadcn@latest add @tool-ui/progress-tracker` is unavailable in
// this sandbox; API & behavior mirror the tool-ui.com/docs/progress-tracker
// documentation 1:1, including the `choice` receipt pattern.)
// ————————————————————————————————————————————————————————————————

export type ProgressStepStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "failed";

export type ProgressStep = {
  id: string;
  label: string;
  description?: string;
  status: ProgressStepStatus;
};

export type ProgressTrackerOutcome =
  | "success"
  | "partial"
  | "failed"
  | "cancelled";

export type ProgressTrackerChoice = {
  outcome: ProgressTrackerOutcome;
  summary: string;
  at: string;
  identifiers?: Record<string, string>;
};

export type ProgressTrackerProps = {
  id: string;
  steps: ProgressStep[];
  elapsedTime?: number;
  choice?: ProgressTrackerChoice;
  className?: string;
};

function formatElapsed(ms: number): string {
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

function currentStepIndex(steps: ProgressStep[]): number {
  const ip = steps.findIndex((s) => s.status === "in-progress");
  if (ip !== -1) return ip;
  const failed = steps.findIndex((s) => s.status === "failed");
  if (failed !== -1) return failed;
  const pending = steps.findIndex((s) => s.status === "pending");
  return pending;
}

const OUTCOME_STYLES: Record<
  ProgressTrackerOutcome,
  { label: string; className: string }
> = {
  success: {
    label: "Success",
    className: "bg-[#e6f4ea] text-[#1e6b3a] border-[#c1e0cc]",
  },
  partial: {
    label: "Partial",
    className: "bg-[#fef3c7] text-[#8a5a12] border-[#fde68a]",
  },
  failed: {
    label: "Failed",
    className: "bg-[#fde2e2] text-[#a31818] border-[#f5b9b9]",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-[#f1f1f0] text-[#6b6b69] border-[#e2e2e0]",
  },
};

function StepIcon({ status }: { status: ProgressStepStatus }) {
  if (status === "completed") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1e6b3a] text-white">
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="flex h-5 w-5 items-center justify-center text-[#0f0e0d] motion-reduce:animate-none">
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a31818] text-white">
        <X className="h-3 w-3" strokeWidth={3} aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center text-[#0f0e0d]/30">
      <Circle className="h-[14px] w-[14px]" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

export function ProgressTracker({
  id,
  steps,
  elapsedTime,
  choice,
  className,
}: ProgressTrackerProps) {
  const activeIndex = React.useMemo(() => currentStepIndex(steps), [steps]);
  const isBusy = steps.some((s) => s.status === "in-progress");
  const isReceipt = !!choice;

  return (
    <section
      id={id}
      role="status"
      aria-live="polite"
      aria-busy={isBusy}
      className={cn(
        "relative rounded-xl border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(15,14,13,0.03)] select-none",
        className,
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2.5 border-b border-black/[0.04]">
        <div className="flex items-center gap-2">
          {isBusy ? (
            <Loader2
              className="h-3.5 w-3.5 animate-spin text-[#0f0e0d]/60"
              strokeWidth={2}
              aria-hidden
            />
          ) : (
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#1e6b3a]"
              aria-hidden
            />
          )}
          <span className="text-[11px] uppercase tracking-[0.14em] text-[#0f0e0d]/55 font-medium">
            {isReceipt ? "Run summary" : isBusy ? "In progress" : "Complete"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {typeof elapsedTime === "number" && elapsedTime > 0 && (
            <time
              dateTime={`PT${Math.max(1, Math.round(elapsedTime / 1000))}S`}
              className="text-[10.5px] font-mono text-[#0f0e0d]/50 tabular-nums"
            >
              {formatElapsed(elapsedTime)}
            </time>
          )}
          {isReceipt && (
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.08em] px-1.5 py-[1px] rounded-[4px] border",
                OUTCOME_STYLES[choice!.outcome].className,
              )}
            >
              {OUTCOME_STYLES[choice!.outcome].label}
            </span>
          )}
        </div>
      </header>

      {/* Steps */}
      <ol className="px-2 py-2">
        {steps.map((step, i) => {
          const isActive = i === activeIndex && !isReceipt;
          return (
            <li
              key={step.id}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex items-start gap-3 px-2 py-2 rounded-md transition-colors",
                isActive && "bg-[#0f0e0d]/[0.035]",
              )}
            >
              <div className="flex-shrink-0 pt-[1px]">
                <StepIcon status={step.status} />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "text-[13px] leading-snug",
                    step.status === "pending"
                      ? "text-[#0f0e0d]/45"
                      : "text-[#0f0e0d]",
                    step.status === "completed" && "text-[#0f0e0d]/75",
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="mt-0.5 text-[11.5px] leading-snug text-[#0f0e0d]/50">
                    {step.description}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Receipt footer */}
      {isReceipt && (
        <footer className="px-4 py-3 border-t border-black/[0.05] bg-[#fafaf8] rounded-b-xl">
          <p className="text-[12px] leading-snug text-[#0f0e0d]/75">
            {choice!.summary}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#0f0e0d]/40">
            <time>{choice!.at}</time>
            {choice!.identifiers &&
              Object.entries(choice!.identifiers).map(([k, v]) => (
                <span key={k} className="font-mono normal-case tracking-normal">
                  {k}: {v}
                </span>
              ))}
          </div>
        </footer>
      )}
    </section>
  );
}

export default ProgressTracker;
