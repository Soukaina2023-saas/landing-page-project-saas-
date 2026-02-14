export type UsagePlan = "demo" | "basic" | "pro";

export interface UsageContext {
  userId: string;
  plan: UsagePlan;
  periodKey: string;
}

export interface UsageRecord {
  requestCount: number;
  imageCount: number;
  lastUpdated: number;
}
