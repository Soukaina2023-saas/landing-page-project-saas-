/**
 * Runtime configuration utility.
 * Isolated, production-safe. Read from environment at module load.
 */

export const isDemoMode = process.env.DEMO_MODE === "true";
