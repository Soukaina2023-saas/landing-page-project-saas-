/**
 * Testing-focused environment flags.
 * Production-safe: defaults to false when unset or invalid.
 */

export function isForceExternalFailureEnabled(): boolean {
  const raw = process.env.FORCE_EXTERNAL_FAILURE;
  if (!raw) return false;

  const normalized = raw.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

