import { pgTable, uuid, varchar, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userPreferences = pgTable(
  "user_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    page: varchar("page", { length: 100 }).notNull(),
    key: varchar("key", { length: 100 }).notNull(),
    value: jsonb("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("user_preferences_user_page_key_idx").on(
      table.userId,
      table.page,
      table.key
    ),
  ]
);
