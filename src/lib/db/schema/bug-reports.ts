import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const bugReports = pgTable("bug_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  userName: varchar("user_name", { length: 255 }),
  page: varchar("page", { length: 500 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).default("normal"), // dusuk, normal, yuksek, kritik
  status: varchar("status", { length: 20 }).default("acik"), // acik, inceleniyor, cozuldu, kapandi
  adminNote: text("admin_note"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
