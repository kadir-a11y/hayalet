import { z } from "zod";

export const campaignCreateSchema = z.object({
  name: z.string().min(1, "Kampanya adı zorunludur").max(255),
  description: z.string().max(2000).optional(),
  targetTagIds: z.array(z.string().uuid()).min(1, "En az bir etiket seçmelisiniz"),
  contentTemplate: z.string().min(1, "İçerik şablonu zorunludur"),
  platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "tiktok"]),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  settings: z
    .object({
      delayMin: z.number().min(0).default(1),
      delayMax: z.number().min(0).default(10),
      maxPerPersona: z.number().min(1).default(1),
    })
    .default({}),
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
