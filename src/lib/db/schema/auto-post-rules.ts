import { pgTable, uuid, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { monitoredTopics } from "./monitored-topics";

export const autoPostRules = pgTable("auto_post_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => monitoredTopics.id, { onDelete: "cascade" }),
  minRelevanceScore: integer("min_relevance_score").default(70),
  targetPlatforms: jsonb("target_platforms").default([]),
  targetPersonaTagIds: jsonb("target_persona_tag_ids").default([]),
  maxPostsPerDay: integer("max_posts_per_day").default(5),
  requiresApproval: boolean("requires_approval").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
