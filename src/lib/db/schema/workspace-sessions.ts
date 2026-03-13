import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";
import { projectMentions } from "./project-mentions";

export const workspaceSessions = pgTable("workspace_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  sourceContentId: uuid("source_content_id")
    .references(() => projectMentions.id, { onDelete: "set null" }),
  aiCommand: text("ai_command"),
  selectedPersonaIds: jsonb("selected_persona_ids").default([]),
  personaFilterCriteria: jsonb("persona_filter_criteria").default({}),
  platform: varchar("platform", { length: 50 }),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
