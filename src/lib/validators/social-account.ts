import { z } from "zod";

export const socialAccountCreateSchema = z.object({
  personaId: z.string().uuid(),
  platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "tiktok", "youtube", "threads", "pinterest", "reddit"]),
  platformUserId: z.string().max(255).optional(),
  platformUsername: z.string().max(255).optional(),
  platformEmail: z.string().max(255).optional(),
  platformPhone: z.string().max(50).optional(),
  platformPassword: z.string().optional(),
  apiEndpoint: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecretKey: z.string().optional(),
  accessToken: z.string().optional(),
  accessTokenSecret: z.string().optional(),
  credentialsRef: z.string().optional(),
  proxyUrl: z.string().optional(),
  proxyType: z.enum(["http", "https", "socks4", "socks5", "residential", "mobile"]).optional(),
  proxyCountry: z.string().max(50).optional(),
  proxyRotation: z.boolean().default(false),
  userAgent: z.string().optional(),
  fingerprint: z.string().optional(),
  accountStatus: z.enum(["active", "suspended", "restricted", "banned"]).default("active"),
  isActive: z.boolean().default(true),
});

export const socialAccountUpdateSchema = socialAccountCreateSchema.partial();

export type SocialAccountCreateInput = z.infer<typeof socialAccountCreateSchema>;
export type SocialAccountUpdateInput = z.infer<typeof socialAccountUpdateSchema>;
