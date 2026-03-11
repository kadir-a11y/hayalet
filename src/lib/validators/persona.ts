import { z } from "zod";

export const personaCreateSchema = z.object({
  name: z.string().min(1, "İsim zorunludur").max(255),
  displayName: z.string().max(255).optional(),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  personalityTraits: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  behavioralPatterns: z
    .object({
      writing_style: z.string().optional(),
      tone: z.string().optional(),
      emoji_usage: z.enum(["none", "minimal", "moderate", "heavy"]).optional(),
      hashtag_style: z.enum(["none", "minimal", "moderate", "heavy"]).optional(),
    })
    .default({}),
  language: z.string().default("tr"),
  timezone: z.string().default("Europe/Istanbul"),
  activeHoursStart: z.number().min(0).max(23).default(9),
  activeHoursEnd: z.number().min(0).max(23).default(23),
  maxPostsPerDay: z.number().min(1).max(100).default(5),
  isActive: z.boolean().default(true),
});

export const personaUpdateSchema = personaCreateSchema.partial();

export type PersonaCreateInput = z.infer<typeof personaCreateSchema>;
export type PersonaUpdateInput = z.infer<typeof personaUpdateSchema>;
