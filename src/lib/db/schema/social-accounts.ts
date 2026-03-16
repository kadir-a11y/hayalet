import { pgTable, uuid, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { personas } from "./personas";

export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  personaId: uuid("persona_id")
    .notNull()
    .references(() => personas.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  platformUserId: varchar("platform_user_id", { length: 255 }),
  platformUsername: varchar("platform_username", { length: 255 }),
  platformEmail: varchar("platform_email", { length: 255 }),
  platformPhone: varchar("platform_phone", { length: 50 }),
  platformPassword: text("platform_password"),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  apiSecretKey: text("api_secret_key"),
  accessToken: text("access_token"),
  accessTokenSecret: text("access_token_secret"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  externalAccountId: text("external_account_id"),
  credentialsRef: text("credentials_ref"),
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("social_accounts_persona_id_idx").on(table.personaId),
]);
