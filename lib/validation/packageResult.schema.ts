import { z } from "zod";

export const packageResultSchema = z.object({
  html: z.string().min(10),
  css: z.string().optional(),
  assets: z.array(
    z.object({
      name: z.string().min(1),
      content: z.string().min(1)
    })
  ).optional()
});
