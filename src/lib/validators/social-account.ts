import { z } from "zod";

export const socialAccountCreateSchema = z.object({
  personaId: z.string().uuid(),
  platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "tiktok"]),
  platformUserId: z.string().max(255).optional(),
  platformUsername: z.string().max(255).optional(),
  credentialsRef: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const socialAccountUpdateSchema = socialAccountCreateSchema.partial();

export type SocialAccountCreateInput = z.infer<typeof socialAccountCreateSchema>;
export type SocialAccountUpdateInput = z.infer<typeof socialAccountUpdateSchema>;
