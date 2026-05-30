/**
 * Dev-only payload returned with scenario generation for debugging LLM calls.
 */

export interface LlmDevDebug {
  capturedAt: string;
  scenarioGeneration: {
    model: string;
    attempt: number;
    rawParsed: unknown;
    chatCompletionResponse?: unknown;
  };
  menuImageSearch?: {
    model: string;
    prompt: string;
    rawResponsesApi?: unknown;
    extractedText?: string;
    parsedImages?: unknown;
    error?: string;
  };
}

export function isDevLlmDebugEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}

export interface SignatureDishDevEntry {
  capturedAt: string;
  turn: number;
  description: string;
  request: {
    description: string;
    turn: number;
  };
  httpStatus: number;
  response: unknown;
}

/** Replace data: URLs with a short preview for dev-panel display/copy. */
export function truncateDataUrlsForDebug(value: unknown): unknown {
  if (typeof value === 'string') {
    if (!value.startsWith('data:')) return value;
    const comma = value.indexOf(',');
    const header = comma >= 0 ? value.slice(0, comma + 1) : value.slice(0, 48);
    const payloadChars = comma >= 0 ? value.length - comma - 1 : value.length;
    return `${header}[base64, ${payloadChars.toLocaleString()} chars]`;
  }
  if (Array.isArray(value)) {
    return value.map(truncateDataUrlsForDebug);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, truncateDataUrlsForDebug(entry)])
    );
  }
  return value;
}
