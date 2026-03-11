import { relations } from "drizzle-orm";

export { users } from "./users";
export { personas } from "./personas";
export { socialAccounts } from "./social-accounts";
export { tags } from "./tags";
export { personaTags } from "./persona-tags";
export { campaigns } from "./campaigns";
export { contentItems } from "./content-items";
export { activityLog } from "./activity-log";

import { users } from "./users";
import { personas } from "./personas";
import { socialAccounts } from "./social-accounts";
import { tags } from "./tags";
import { personaTags } from "./persona-tags";
import { campaigns } from "./campaigns";
import { contentItems } from "./content-items";
import { activityLog } from "./activity-log";

// ── Users relations ──────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  personas: many(personas),
  tags: many(tags),
  campaigns: many(campaigns),
  activityLogs: many(activityLog),
}));

// ── Personas relations ───────────────────────────────────────────────
export const personasRelations = relations(personas, ({ one, many }) => ({
  user: one(users, {
    fields: [personas.userId],
    references: [users.id],
  }),
  socialAccounts: many(socialAccounts),
  contentItems: many(contentItems),
  personaTags: many(personaTags),
}));

// ── Social accounts relations ────────────────────────────────────────
export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  persona: one(personas, {
    fields: [socialAccounts.personaId],
    references: [personas.id],
  }),
}));

// ── Tags relations ───────────────────────────────────────────────────
export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  personaTags: many(personaTags),
}));

// ── Persona tags (join table) relations ──────────────────────────────
export const personaTagsRelations = relations(personaTags, ({ one }) => ({
  persona: one(personas, {
    fields: [personaTags.personaId],
    references: [personas.id],
  }),
  tag: one(tags, {
    fields: [personaTags.tagId],
    references: [tags.id],
  }),
}));

// ── Campaigns relations ──────────────────────────────────────────────
export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  contentItems: many(contentItems),
}));

// ── Content items relations ──────────────────────────────────────────
export const contentItemsRelations = relations(contentItems, ({ one }) => ({
  persona: one(personas, {
    fields: [contentItems.personaId],
    references: [personas.id],
  }),
  campaign: one(campaigns, {
    fields: [contentItems.campaignId],
    references: [campaigns.id],
  }),
}));

// ── Activity log relations ───────────────────────────────────────────
export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));
