import { z } from "zod";

export const topicCreateSchema = z.object({
  name: z.string().min(1, "Konu adi zorunludur").max(255),
  keywords: z.array(z.string()).min(1, "En az bir anahtar kelime gerekli"),
  language: z.string().max(10).default("tr"),
  checkIntervalMinutes: z.number().int().min(5).max(1440).default(60),
  isActive: z.boolean().default(true),
});

export const topicUpdateSchema = topicCreateSchema.partial();

export const sourceCreateSchema = z.object({
  sourceType: z.enum(["google_news", "rss", "reddit", "youtube", "twitter", "tiktok", "instagram"]),
  config: z.record(z.unknown()).default({}),
  isActive: z.boolean().default(true),
});

export const sourceUpdateSchema = sourceCreateSchema.partial();

export const ruleCreateSchema = z.object({
  minRelevanceScore: z.number().int().min(0).max(100).default(70),
  targetPlatforms: z.array(z.string()).default([]),
  targetPersonaTagIds: z.array(z.string()).default([]),
  maxPostsPerDay: z.number().int().min(1).max(100).default(5),
  requiresApproval: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const ruleUpdateSchema = ruleCreateSchema.partial();

export type TopicCreateInput = z.infer<typeof topicCreateSchema>;
export type TopicUpdateInput = z.infer<typeof topicUpdateSchema>;
export type SourceCreateInput = z.infer<typeof sourceCreateSchema>;
export type SourceUpdateInput = z.infer<typeof sourceUpdateSchema>;
export type RuleCreateInput = z.infer<typeof ruleCreateSchema>;
export type RuleUpdateInput = z.infer<typeof ruleUpdateSchema>;
