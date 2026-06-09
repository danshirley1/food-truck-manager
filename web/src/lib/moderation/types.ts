export type ModerationProviderName = 'rules' | 'huggingface' | 'openai';

export type ModerationAllowed = {
  allowed: true;
  provider: ModerationProviderName;
  scores?: Record<string, number>;
};

export type ModerationBlocked = {
  allowed: false;
  provider: ModerationProviderName;
  reason: string;
  labels?: string[];
  scores?: Record<string, number>;
};

export type ModerationResult = ModerationAllowed | ModerationBlocked;

export type ModerationConfig = {
  enabled: boolean;
  provider: ModerationProviderName | 'rules-only';
  threshold: number;
  huggingFaceApiKey?: string;
  huggingFaceModel: string;
  openAiApiKey?: string;
};

export const MODERATION_BLOCKED_USER_MESSAGE =
  "That description doesn't fit our family-friendly kitchen — try another dish idea.";
