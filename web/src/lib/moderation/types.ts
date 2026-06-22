export type ModerationProviderName =
  | 'rules'
  | 'huggingface'
  | 'openai'
  | 'local-model'
  | 'profanity-model';

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
  /** Dedicated Inference Endpoints URL (required for custom models on cloud) */
  huggingFaceInferenceEndpoint?: string;
  /** Pre-trained catalog model — catches profanity (default: obscene label only). */
  profanityCheckEnabled: boolean;
  profanityModel: string;
  profanityThreshold: number;
  profanityLabels: string[];
  profanityInsultHardThreshold: number;
  profanityInsultSoftMin: number;
  profanityInsultSoftMax: number;
  profanityThreatThreshold: number;
  profanityIdentityThreshold: number;
  openAiApiKey?: string;
  localModelPath?: string;
};

export const MODERATION_BLOCKED_USER_MESSAGE =
  "That description doesn't fit our family-friendly kitchen — try another dish idea.";
