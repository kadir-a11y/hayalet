import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { roleCategories } from "./role-categories";

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  categoryId: uuid("category_id")
    .references(() => roleCategories.id, { onDelete: "set null" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#6B7280"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
