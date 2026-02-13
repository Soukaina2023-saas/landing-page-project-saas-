import { z } from "zod";

export const removeBackgroundSchema = z.object({
  image_url: z.string().url().optional(),
  image_base64: z.string().optional()
}).refine(
  (data) => data.image_url || data.image_base64,
  {
    message: "Either image_url or image_base64 is required"
  }
);
