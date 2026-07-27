import { z } from "zod";

export const captureSchema = z.object({
  spaceKind: z.enum(["work", "personal"]),
  text: z
    .string()
    .trim()
    .min(1, "先写下一点内容")
    .max(5000, "单条记录最多 5000 个字符"),
});

export const entryUpdateSchema = z.object({
  type: z.enum(["unclassified", "journal"]),
});
