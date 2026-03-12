import { pgTable, uuid, varchar, jsonb, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const monitoredTopics = pgTable("monitored_topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  keywords: jsonb("keywords").default([]),
  language: varchar("language", { length: 10 }).default("tr"),
  isActive: boolean("is_active").default(true),
  checkIntervalMinutes: integer("check_interval_minutes").default(60),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
