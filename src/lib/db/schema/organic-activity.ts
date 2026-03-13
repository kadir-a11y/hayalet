import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { personas } from "./personas";

export const organicActivityConfig = pgTable("organic_activity_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  personaId: uuid("persona_id")
    .references(() => personas.id, { onDelete: "cascade" }),
  activityTypes: jsonb("activity_types").default(["like", "retweet", "positive_comment"]),
  platform: varchar("platform", { length: 50 }).notNull(),
  frequencyMin: integer("frequency_min").default(2),
  frequencyMax: integer("frequency_max").default(8),
  sentimentRange: varchar("sentiment_range", { length: 20 }).default("positive"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const organicActivityLog = pgTable("organic_activity_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  configId: uuid("config_id")
    .notNull()
    .references(() => organicActivityConfig.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  personaId: uuid("persona_id")
    .notNull()
    .references(() => personas.id),
  activityType: varchar("activity_type", { length: 30 }).notNull(),
  targetUrl: text("target_url"),
  targetContent: text("target_content"),
  generatedContent: text("generated_content"),
  platform: varchar("platform", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  executedAt: timestamp("executed_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
