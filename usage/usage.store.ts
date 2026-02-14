import type { UsageRecord } from "./usage.types.js";

const usageStore = new Map<string, UsageRecord>();

export function getUsageRecord(key: string): UsageRecord | undefined {
  return usageStore.get(key);
}

export function setUsageRecord(key: string, record: UsageRecord): void {
  usageStore.set(key, record);
}

export function resetUsageStore(): void {
  usageStore.clear();
}
