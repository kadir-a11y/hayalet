import { pgTable, uuid, varchar, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { monitoredTopics } from "./monitored-topics";

export const monitoringSources = pgTable("monitoring_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => monitoredTopics.id, { onDelete: "cascade" }),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  config: jsonb("config").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
