import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { workspaceSessions } from "./workspace-sessions";
import { projects } from "./projects";
import { personas } from "./personas";
import { projectMentions } from "./project-mentions";
import { contentItems } from "./content-items";

export const workspaceResponses = pgTable("workspace_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => workspaceSessions.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  personaId: uuid("persona_id")
    .notNull()
    .references(() => personas.id, { onDelete: "cascade" }),
  sourceContentId: uuid("source_content_id")
    .references(() => projectMentions.id, { onDelete: "set null" }),
  generatedContent: text("generated_content").notNull(),
  editedContent: text("edited_content"),
  sentiment: varchar("sentiment", { length: 20 }),
  platform: varchar("platform", { length: 50 }).notNull(),
  contentType: varchar("content_type", { length: 30 }).default("reply"),
  aiPrompt: text("ai_prompt"),
  aiModel: varchar("ai_model", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending_review"),
  contentItemId: uuid("content_item_id")
    .references(() => contentItems.id, { onDelete: "set null" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
