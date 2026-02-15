/**
 * Centralized feature flags configuration.
 * Production-safe. Not connected to logic yet.
 */

export const FEATURE_FLAGS = {
  ENABLE_AI_GENERATION: true,
  ENABLE_BACKGROUND_REMOVAL: true,
  ENABLE_PROMPT_ANALYSIS: true,
} as const;
