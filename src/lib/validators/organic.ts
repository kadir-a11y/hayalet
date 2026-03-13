import { z } from "zod";

export const organicActivityTypes = ["like", "retweet", "positive_comment", "share", "follow", "bookmark"] as const;
export const organicPlatforms = ["twitter", "instagram", "facebook", "linkedin", "tiktok", "reddit"] as const;
export const organicSentimentRanges = ["positive", "neutral", "mixed"] as const;

export const organicConfigCreateSchema = z.object({
  personaId: z.string().uuid().optional(),
  activityTypes: z.array(z.enum(organicActivityTypes)).min(1).default(["like", "retweet", "positive_comment"]),
  platform: z.enum(organicPlatforms),
  frequencyMin: z.number().min(1).max(50).default(2),
  frequencyMax: z.number().min(1).max(100).default(8),
  sentimentRange: z.enum(organicSentimentRanges).default("positive"),
  isActive: z.boolean().default(false),
}).refine(
  (data) => data.frequencyMax >= data.frequencyMin,
  { message: "frequencyMax, frequencyMin'den büyük veya eşit olmalıdır" }
);

export const organicConfigUpdateSchema = z.object({
  personaId: z.string().uuid().optional(),
  activityTypes: z.array(z.enum(organicActivityTypes)).min(1).optional(),
  platform: z.enum(organicPlatforms).optional(),
  frequencyMin: z.number().min(1).max(50).optional(),
  frequencyMax: z.number().min(1).max(100).optional(),
  sentimentRange: z.enum(organicSentimentRanges).optional(),
  isActive: z.boolean().optional(),
});

export type OrganicConfigCreateInput = z.infer<typeof organicConfigCreateSchema>;
export type OrganicConfigUpdateInput = z.infer<typeof organicConfigUpdateSchema>;
