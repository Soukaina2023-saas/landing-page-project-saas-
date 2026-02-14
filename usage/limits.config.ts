export const MAX_IMAGES_PER_REQUEST = 4;
export const MAX_BATCH_SIZE = 6;

export const DEMO_LIMITS = {
  maxRequests: 20,
  maxImages: 40,
} as const;

export const BASIC_LIMITS = {
  maxRequests: 200,
  maxImages: 400,
} as const;

export const PRO_LIMITS = {
  maxRequests: 1000,
  maxImages: 3000,
} as const;
