import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { systemRoles, userSystemRoles } from "@/lib/db/schema/user-roles";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Permission } from "./permissions";

export { PERMISSIONS, DEFAULT_ROLES } from "./permissions";
export type { Permission } from "./permissions";

/**
 * Get all permissions for a user.
 * Falls back to isAdmin boolean for backward compatibility:
 * - isAdmin=true → all permissions (treated as admin role)
 * - isAdmin=false with no system roles → editor permissions (default)
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  // Check system roles first
  const roleRows = await db
    .select({ permissions: systemRoles.permissions })
    .from(userSystemRoles)
    .innerJoin(systemRoles, eq(userSystemRoles.roleId, systemRoles.id))
    .where(eq(userSystemRoles.userId, userId));

  if (roleRows.length > 0) {
    // Union all permissions from assigned roles
    const permSet = new Set<string>();
    for (const row of roleRows) {
      const perms = row.permissions as string[];
      for (const p of perms) permSet.add(p);
    }
    return Array.from(permSet);
  }

  // Fallback: legacy isAdmin boolean
  const [user] = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return [];

  // isAdmin=true → import all permissions dynamically
  if (user.isAdmin) {
    const { PERMISSIONS } = await import("./permissions");
    return Object.values(PERMISSIONS);
  }

  // Default: editor-level permissions for non-admin users without roles
  const { DEFAULT_ROLES } = await import("./permissions");
  return [...DEFAULT_ROLES.editor.permissions];
}

/**
 * Check if a user has a specific permission.
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission) || permissions.includes("system:admin");
}

/**
 * Check if a user has ALL of the specified permissions.
 */
export async function hasAllPermissions(userId: string, required: Permission[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  if (permissions.includes("system:admin")) return true;
  return required.every((p) => permissions.includes(p));
}

/**
 * Check if a user has ANY of the specified permissions.
 */
export async function hasAnyPermission(userId: string, required: Permission[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  if (permissions.includes("system:admin")) return true;
  return required.some((p) => permissions.includes(p));
}

/**
 * API route guard. Use in route handlers:
 *
 * ```ts
 * export async function POST(req: NextRequest) {
 *   const guard = await requirePermission("content:create");
 *   if (guard.error) return guard.error;
 *   const { userId, permissions } = guard;
 *   // ... rest of handler
 * }
 * ```
 */
export async function requirePermission(
  ...required: Permission[]
): Promise<
  | { error: NextResponse; userId?: never; permissions?: never }
  | { error?: never; userId: string; permissions: string[] }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const permissions = await getUserPermissions(session.user.id);
  const hasAdmin = permissions.includes("system:admin");

  if (!hasAdmin && required.length > 0) {
    const missing = required.filter((p) => !permissions.includes(p));
    if (missing.length > 0) {
      return {
        error: NextResponse.json(
          { error: "Forbidden", missing },
          { status: 403 }
        ),
      };
    }
  }

  return { userId: session.user.id, permissions };
}
