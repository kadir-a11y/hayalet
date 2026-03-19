import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "İsim zorunludur").max(255).transform((v) => v.trim()),
  image: z.string().url().nullable().optional(),
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre zorunludur"),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
});

export const preferenceSetSchema = z.object({
  page: z.string().min(1, "page zorunludur"),
  key: z.string().min(1, "key zorunludur"),
  value: z.unknown(),
});

export const bugReportCreateSchema = z.object({
  page: z.string().min(1, "Sayfa zorunludur"),
  description: z.string().min(1, "Açıklama zorunludur"),
  priority: z.enum(["dusuk", "normal", "yuksek", "kritik"]).default("normal"),
});

export const influenceScoresSchema = z.object({
  personaIds: z.array(z.string().uuid()).optional(),
});
