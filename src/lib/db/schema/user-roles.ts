import { pgTable, uuid, varchar, jsonb, timestamp, index, unique } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * System roles for RBAC.
 * Not to be confused with persona-roles (which assign personas to project roles).
 * These are user-level access control roles.
 */
export const systemRoles = pgTable("system_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  isDefault: varchar("is_default", { length: 10 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Maps users to system roles. A user can have multiple roles.
 * Permissions are the union of all assigned role permissions.
 */
export const userSystemRoles = pgTable("user_system_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => systemRoles.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("user_system_roles_user_idx").on(table.userId),
  unique("user_system_roles_unique").on(table.userId, table.roleId),
]);
