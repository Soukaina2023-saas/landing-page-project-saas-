import { z } from "zod";

export const generateBatchSchema = z.object({
  prompts: z.array(
    z.object({
      image_role: z.string().optional(),
      prompt_text: z.string().min(5),
      aspect_ratio: z.string().optional(),
    })
  ).min(1)
});
