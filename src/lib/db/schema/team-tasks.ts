import { pgTable, uuid, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const teamTasks = pgTable("team_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskCode: varchar("task_code", { length: 20 }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  priority: varchar("priority", { length: 20 }).default("normal").notNull(),
  phase: varchar("phase", { length: 50 }),
  category: varchar("category", { length: 20 }).default("dev").notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  dependency: text("dependency"),
  solution: text("solution"),
  resultNote: text("result_note"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
