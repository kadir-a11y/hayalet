/**
 * RBAC Permission Constants
 *
 * Naming convention: RESOURCE:ACTION
 * Resources: personas, projects, campaigns, content, settings, users, analytics, monitoring
 * Actions: read, create, update, delete, manage (full CRUD + admin)
 */

export const PERMISSIONS = {
  // Persona management
  PERSONAS_READ: "personas:read",
  PERSONAS_CREATE: "personas:create",
  PERSONAS_UPDATE: "personas:update",
  PERSONAS_DELETE: "personas:delete",
  PERSONAS_MANAGE: "personas:manage",

  // Project management
  PROJECTS_READ: "projects:read",
  PROJECTS_CREATE: "projects:create",
  PROJECTS_UPDATE: "projects:update",
  PROJECTS_DELETE: "projects:delete",
  PROJECTS_MANAGE: "projects:manage",

  // Campaign management
  CAMPAIGNS_READ: "campaigns:read",
  CAMPAIGNS_CREATE: "campaigns:create",
  CAMPAIGNS_UPDATE: "campaigns:update",
  CAMPAIGNS_DELETE: "campaigns:delete",
  CAMPAIGNS_EXECUTE: "campaigns:execute",

  // Content management
  CONTENT_READ: "content:read",
  CONTENT_CREATE: "content:create",
  CONTENT_UPDATE: "content:update",
  CONTENT_DELETE: "content:delete",
  CONTENT_PUBLISH: "content:publish",

  // AI features
  AI_GENERATE: "ai:generate",

  // Analytics
  ANALYTICS_READ: "analytics:read",
  ANALYTICS_EXPORT: "analytics:export",

  // Monitoring
  MONITORING_READ: "monitoring:read",
  MONITORING_MANAGE: "monitoring:manage",

  // Social accounts
  SOCIAL_ACCOUNTS_READ: "social_accounts:read",
  SOCIAL_ACCOUNTS_MANAGE: "social_accounts:manage",

  // Settings & admin
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",
  USERS_MANAGE: "users:manage",
  SYSTEM_ADMIN: "system:admin",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Default role definitions.
 * These are seeded into the system_roles table on first run.
 */
export const DEFAULT_ROLES = {
  admin: {
    name: "admin",
    description: "Full system access",
    permissions: Object.values(PERMISSIONS),
  },
  editor: {
    name: "editor",
    description: "Can create and edit content, personas, projects",
    permissions: [
      PERMISSIONS.PERSONAS_READ,
      PERMISSIONS.PERSONAS_CREATE,
      PERMISSIONS.PERSONAS_UPDATE,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.PROJECTS_CREATE,
      PERMISSIONS.PROJECTS_UPDATE,
      PERMISSIONS.CAMPAIGNS_READ,
      PERMISSIONS.CAMPAIGNS_CREATE,
      PERMISSIONS.CAMPAIGNS_UPDATE,
      PERMISSIONS.CAMPAIGNS_EXECUTE,
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.AI_GENERATE,
      PERMISSIONS.ANALYTICS_READ,
      PERMISSIONS.MONITORING_READ,
      PERMISSIONS.SOCIAL_ACCOUNTS_READ,
      PERMISSIONS.SOCIAL_ACCOUNTS_MANAGE,
      PERMISSIONS.SETTINGS_READ,
      PERMISSIONS.SETTINGS_UPDATE,
    ],
  },
  viewer: {
    name: "viewer",
    description: "Read-only access",
    permissions: [
      PERMISSIONS.PERSONAS_READ,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.CAMPAIGNS_READ,
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.ANALYTICS_READ,
      PERMISSIONS.MONITORING_READ,
      PERMISSIONS.SOCIAL_ACCOUNTS_READ,
      PERMISSIONS.SETTINGS_READ,
    ],
  },
} as const;
