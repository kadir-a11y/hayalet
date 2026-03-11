import { z } from "zod";

export const tagCreateSchema = z.object({
  name: z.string().min(1, "Etiket adı zorunludur").max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir renk kodu giriniz").default("#6B7280"),
});

export const tagUpdateSchema = tagCreateSchema.partial();

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
