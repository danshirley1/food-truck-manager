'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SignatureDishDevEntry } from '@/lib/types/llm-dev-debug';

export const SIGNATURE_DISH_MAX_LENGTH = 200;

export type SignatureDishStatus = 'generating' | 'ready' | 'error';

export interface SignatureDishRecord {
  turn: number;
  description: string;
  status: SignatureDishStatus;
  imageUrl?: string;
  error?: string;
}

export function useSignatureDish(currentTurn: number) {
  const [draft, setDraft] = useState('');
  const [records, setRecords] = useState<SignatureDishRecord[]>([]);
  const [devLog, setDevLog] = useState<SignatureDishDevEntry[]>([]);
  const requestGenerationRef = useRef(0);

  const currentRecord = records.find((r) => r.turn === currentTurn);
  const history = records
    .filter((r) => r.turn !== currentTurn)
    .sort((a, b) => b.turn - a.turn);

  useEffect(() => {
    setDraft('');
  }, [currentTurn]);

  const reset = useCallback(() => {
    requestGenerationRef.current += 1;
    setDraft('');
    setRecords([]);
    setDevLog([]);
  }, []);

  const clearCurrent = useCallback(() => {
    requestGenerationRef.current += 1;
    setDraft('');
    setRecords((prev) => prev.filter((r) => r.turn !== currentTurn));
  }, [currentTurn]);

  const submit = useCallback(() => {
    const description = draft.trim();
    if (!description || description.length > SIGNATURE_DISH_MAX_LENGTH) return;
    if (currentRecord?.status === 'generating' || currentRecord?.status === 'ready') {
      return;
    }

    const generation = ++requestGenerationRef.current;
    const turn = currentTurn;
    const request = { description, turn };

    setRecords((prev) => [
      ...prev.filter((r) => r.turn !== turn),
      { turn, description, status: 'generating' },
    ]);

    void fetch('/api/signature-dish/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as {
          success?: boolean;
          imageUrl?: string;
          error?: string;
        };

        if (process.env.NODE_ENV === 'development') {
          setDevLog((prev) => [
            {
              capturedAt: new Date().toISOString(),
              turn,
              description,
              request,
              httpStatus: response.status,
              response: data,
            },
            ...prev,
          ]);
        }

        if (generation !== requestGenerationRef.current) return;

        setRecords((prev) =>
          prev.map((r) =>
            r.turn === turn
              ? {
                  ...r,
                  status: response.ok && data.success && data.imageUrl ? 'ready' : 'error',
                  imageUrl: data.imageUrl,
                  error:
                    response.ok && data.success
                      ? undefined
                      : (data.error ?? `Request failed (${response.status})`),
                }
              : r
          )
        );
      })
      .catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          setDevLog((prev) => [
            {
              capturedAt: new Date().toISOString(),
              turn,
              description,
              request,
              httpStatus: 0,
              response: {
                error: err instanceof Error ? err.message : 'Network error',
              },
            },
            ...prev,
          ]);
        }

        if (generation !== requestGenerationRef.current) return;
        setRecords((prev) =>
          prev.map((r) =>
            r.turn === turn
              ? {
                  ...r,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'Network error',
                }
              : r
          )
        );
      });
  }, [currentTurn, currentRecord?.status, draft]);

  const canSubmit =
    draft.trim().length > 0 &&
    draft.length <= SIGNATURE_DISH_MAX_LENGTH &&
    currentRecord?.status !== 'generating' &&
    currentRecord?.status !== 'ready';

  return {
    draft,
    setDraft,
    submit,
    reset,
    clearCurrent,
    canSubmit,
    currentRecord,
    history,
    devLog,
  };
}
