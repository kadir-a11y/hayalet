import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { personas } from "./personas";

export const forumAccounts = pgTable("forum_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  personaId: uuid("persona_id")
    .notNull()
    .references(() => personas.id, { onDelete: "cascade" }),
  portalName: varchar("portal_name", { length: 255 }).notNull(),
  portalUrl: varchar("portal_url", { length: 500 }),
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  password: text("password"),
  emailPassword: text("email_password"),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  apiSecretKey: text("api_secret_key"),
  accessToken: text("access_token"),
  accessTokenSecret: text("access_token_secret"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
