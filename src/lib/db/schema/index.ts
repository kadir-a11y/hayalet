import { relations } from "drizzle-orm";

export { users } from "./users";
export { personas } from "./personas";
export { socialAccounts } from "./social-accounts";
export { forumAccounts } from "./forum-accounts";
export { roleCategories } from "./role-categories";
export { roles } from "./roles";
export { personaRoles } from "./persona-roles";
export { tags } from "./tags";
export { personaTags } from "./persona-tags";
export { campaigns } from "./campaigns";
export { contentItems } from "./content-items";
export { mediaLibrary } from "./media";
export { activityLog } from "./activity-log";

import { users } from "./users";
import { personas } from "./personas";
import { socialAccounts } from "./social-accounts";
import { forumAccounts } from "./forum-accounts";
import { roleCategories } from "./role-categories";
import { roles } from "./roles";
import { personaRoles } from "./persona-roles";
import { tags } from "./tags";
import { personaTags } from "./persona-tags";
import { campaigns } from "./campaigns";
import { contentItems } from "./content-items";
import { mediaLibrary } from "./media";
import { activityLog } from "./activity-log";

// ── Users relations ──────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  personas: many(personas),
  tags: many(tags),
  roleCategories: many(roleCategories),
  roles: many(roles),
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
  forumAccounts: many(forumAccounts),
  contentItems: many(contentItems),
  personaTags: many(personaTags),
  personaRoles: many(personaRoles),
  media: many(mediaLibrary),
}));

// ── Social accounts relations ────────────────────────────────────────
export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  persona: one(personas, {
    fields: [socialAccounts.personaId],
    references: [personas.id],
  }),
}));

// ── Forum accounts relations ────────────────────────────────────────
export const forumAccountsRelations = relations(forumAccounts, ({ one }) => ({
  persona: one(personas, {
    fields: [forumAccounts.personaId],
    references: [personas.id],
  }),
}));

// ── Role categories relations ───────────────────────────────────────
export const roleCategoriesRelations = relations(roleCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [roleCategories.userId],
    references: [users.id],
  }),
  roles: many(roles),
}));

// ── Roles relations ─────────────────────────────────────────────────
export const rolesRelations = relations(roles, ({ one, many }) => ({
  user: one(users, {
    fields: [roles.userId],
    references: [users.id],
  }),
  category: one(roleCategories, {
    fields: [roles.categoryId],
    references: [roleCategories.id],
  }),
  personaRoles: many(personaRoles),
}));

// ── Persona roles (join table) relations ────────────────────────────
export const personaRolesRelations = relations(personaRoles, ({ one }) => ({
  persona: one(personas, {
    fields: [personaRoles.personaId],
    references: [personas.id],
  }),
  role: one(roles, {
    fields: [personaRoles.roleId],
    references: [roles.id],
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

// ── Media library relations ─────────────────────────────────────────
export const mediaLibraryRelations = relations(mediaLibrary, ({ one }) => ({
  persona: one(personas, {
    fields: [mediaLibrary.personaId],
    references: [personas.id],
  }),
}));

// ── Activity log relations ───────────────────────────────────────────
export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));
