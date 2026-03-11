import { z } from "zod";

export const roleCategoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().max(7).optional(),
});

export const roleCategoryUpdateSchema = roleCategoryCreateSchema.partial();

export const roleCreateSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().max(7).optional(),
});

export const roleUpdateSchema = roleCreateSchema.partial();

export type RoleCategoryCreateInput = z.infer<typeof roleCategoryCreateSchema>;
export type RoleCategoryUpdateInput = z.infer<typeof roleCategoryUpdateSchema>;
export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
