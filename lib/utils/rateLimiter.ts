const WINDOW_SIZE_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

type RateData = {
  count: number;
  startTime: number;
};

const ipStore = new Map<string, RateData>();

export function checkRateLimit(ip: string) {
  const now = Date.now();

  const record = ipStore.get(ip);

  if (!record) {
    ipStore.set(ip, { count: 1, startTime: now });
    return { allowed: true };
  }

  if (now - record.startTime > WINDOW_SIZE_MS) {
    ipStore.set(ip, { count: 1, startTime: now });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false };
  }

  record.count += 1;
  return { allowed: true };
}
