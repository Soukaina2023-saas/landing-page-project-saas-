export type AuthPlan = "demo" | "basic" | "pro" | "agency";

export type RequestContext = {
  userId?: string;
  isAuthenticated: boolean;
  plan: AuthPlan;
};
