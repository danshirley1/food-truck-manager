'use client';

import { useCallback, useState } from 'react';
import type { LlmDevDebug } from '@/lib/types/llm-dev-debug';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DevLlmDebugPanelProps {
  debug: LlmDevDebug | null;
}

interface DebugSectionProps {
  title: string;
  data: unknown;
}

function DebugSection({ title, data }: DebugSectionProps) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(data, null, 2);

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
    <div className="mb-4 last:mb-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-amber-300">{title}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 text-xs text-amber-400 underline-offset-2 hover:text-amber-300 hover:underline"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-all rounded border border-zinc-800 bg-zinc-900/80 p-2 font-mono text-[11px] leading-relaxed text-zinc-300">
        {text}
      </pre>
    </div>
  );
}

export function DevLlmDebugPanel({ debug }: DevLlmDebugPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-amber-500 bg-zinc-950 text-zinc-100 shadow-[0_-8px_30px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-400 hover:bg-zinc-900"
      >
        <span>Dev · LLM raw responses</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronUp className="h-4 w-4 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="max-h-[40vh] overflow-auto border-t border-zinc-800 px-4 py-3">
          {!debug ? (
            <p className="text-sm text-zinc-500">
              No scenario loaded yet — start or advance a day to capture LLM output.
            </p>
          ) : (
            <>
              <DebugSection title="Scenario generation" data={debug.scenarioGeneration} />
              {debug.menuImageSearch ? (
                <DebugSection title="Menu image search" data={debug.menuImageSearch} />
              ) : (
                <p className="text-xs text-zinc-500">Menu image search: no data captured.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
