import { z } from "zod";
import { validateTwitterContent } from "@/lib/platforms/twitter/validation";

const contentItemBaseSchema = z.object({
  personaId: z.string().uuid(),
  campaignId: z.string().uuid().optional(),
  platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "tiktok", "reddit"]),
  contentType: z.enum(["post", "reply", "comment", "story", "reel"]).default("post"),
  content: z.string().min(1, "İçerik zorunludur"),
  mediaUrls: z.array(z.string().url()).default([]),
  status: z.enum(["draft", "scheduled", "queued", "publishing", "published", "failed", "cancelled"]).default("draft"),
  scheduledAt: z.string().datetime().optional(),
  aiGenerated: z.boolean().default(false),
  aiPrompt: z.string().optional(),
  aiModel: z.string().optional(),
});

export const contentItemCreateSchema = contentItemBaseSchema.superRefine((data, ctx) => {
  if (data.platform === "twitter" && data.status !== "draft") {
    const result = validateTwitterContent(data.content, data.mediaUrls?.length || 0);
    for (const error of result.errors) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: error, path: ["content"] });
    }
  }
});

export const contentItemUpdateSchema = contentItemBaseSchema.partial();

export const bulkContentCreateSchema = z.object({
  personaIds: z.array(z.string().uuid()).min(1),
  platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "tiktok", "reddit"]),
  contentType: z.enum(["post", "reply", "comment", "story", "reel"]).default("post"),
  content: z.string().min(1),
  scheduledAt: z.string().datetime().optional(),
});

export type ContentItemCreateInput = z.infer<typeof contentItemCreateSchema>;
export type ContentItemUpdateInput = z.infer<typeof contentItemUpdateSchema>;
export type BulkContentCreateInput = z.infer<typeof bulkContentCreateSchema>;
