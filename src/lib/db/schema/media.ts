import { pgTable, uuid, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
import { personas } from "./personas";

export const mediaLibrary = pgTable("media_library", {
  id: uuid("id").defaultRandom().primaryKey(),
  personaId: uuid("persona_id")
    .notNull()
    .references(() => personas.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // image, video, document
  filename: varchar("filename", { length: 500 }).notNull(),
  r2Key: text("r2_key").notNull(),
  url: text("url").notNull(),
  contentType: varchar("content_type", { length: 100 }),
  size: integer("size"), // bytes
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
