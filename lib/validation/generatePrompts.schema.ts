import { z } from "zod";

export const generatePromptsSchema = z.object({
  productName: z.string().min(3),
  description: z.string().min(10),
  tone: z.string().optional(),
  audience: z.string().optional(),
});
