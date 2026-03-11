import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const personas = pgTable("personas", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  personalityTraits: jsonb("personality_traits").default([]),
  interests: jsonb("interests").default([]),
  behavioralPatterns: jsonb("behavioral_patterns").default({}),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  language: varchar("language", { length: 10 }).default("tr"),
  timezone: varchar("timezone", { length: 50 }).default("Europe/Istanbul"),
  activeHoursStart: integer("active_hours_start").default(9),
  activeHoursEnd: integer("active_hours_end").default(23),
  maxPostsPerDay: integer("max_posts_per_day").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
