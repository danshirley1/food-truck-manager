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
