'use client';

import { useCallback, useState } from 'react';
import {
  truncateDataUrlsForDebug,
  type LlmDevDebug,
  type SignatureDishDevEntry,
} from '@/lib/types/llm-dev-debug';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DevLlmDebugPanelProps {
  debug: LlmDevDebug | null;
  signatureDishDebug?: SignatureDishDevEntry[];
}

interface DebugSectionProps {
  title: string;
  data: unknown;
  defaultOpen?: boolean;
}

function DebugSection({ title, data, defaultOpen = false }: DebugSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(truncateDataUrlsForDebug(data), null, 2);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <div className="mb-2 last:mb-0 rounded border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-xs font-semibold text-amber-300 hover:text-amber-200"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate">{title}</span>
        </button>
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 text-xs text-amber-400 underline-offset-2 hover:text-amber-300 hover:underline"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {open && (
        <pre className="max-h-[28vh] overflow-auto whitespace-pre-wrap break-all border-t border-zinc-800 p-2 font-mono text-[11px] leading-relaxed text-zinc-300">
          {text}
        </pre>
      )}
    </div>
  );
}

export function DevLlmDebugPanel({
  debug,
  signatureDishDebug = [],
}: DevLlmDebugPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const hasScenario = Boolean(debug);
  const hasSignatureDish = signatureDishDebug.length > 0;
  const hasAnyData = hasScenario || hasSignatureDish;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-amber-500 bg-zinc-950 text-zinc-100 shadow-[0_-8px_30px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-400 hover:bg-zinc-900"
      >
        <span className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          Dev · LLM raw responses
        </span>
      </button>

      {expanded && (
        <div className="max-h-[40vh] overflow-auto border-t border-zinc-800 px-4 py-3">
          {!hasAnyData ? (
            <p className="text-sm text-zinc-500">
              No captured responses yet — load a scenario or create a Signature Dish.
            </p>
          ) : (
            <>
              {hasScenario && debug && (
                <>
                  <DebugSection title="Scenario generation" data={debug.scenarioGeneration} />
                  {debug.menuImageSearch ? (
                    <DebugSection title="Menu image search" data={debug.menuImageSearch} />
                  ) : (
                    <p className="mb-2 text-xs text-zinc-500">
                      Menu image search: no data captured.
                    </p>
                  )}
                </>
              )}

              {signatureDishDebug.map((entry, index) => (
                <div key={`${entry.capturedAt}-${entry.turn}-${index}`}>
                  <DebugSection
                    title={`Signature dish — "${entry.description.slice(0, 48)}${
                      entry.description.length > 48 ? '…' : ''
                    }"`}
                    data={entry}
                  />
                  {entry.moderation ? (
                    <DebugSection
                      title={`Moderation — ${entry.description.slice(0, 32)}${
                        entry.description.length > 32 ? '…' : ''
                      }`}
                      data={entry.moderation}
                    />
                  ) : null}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
