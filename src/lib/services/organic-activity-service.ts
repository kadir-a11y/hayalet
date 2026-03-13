import { db } from "@/lib/db";
import { organicActivityConfig, organicActivityLog, personas } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { OrganicConfigCreateInput, OrganicConfigUpdateInput } from "@/lib/validators/organic";

// ── Config CRUD ──────────────────────────────────────────────────────

export async function getConfigs(projectId: string) {
  const configs = await db
    .select({
      config: organicActivityConfig,
      personaName: personas.name,
      personaAvatar: personas.avatarUrl,
    })
    .from(organicActivityConfig)
    .leftJoin(personas, eq(organicActivityConfig.personaId, personas.id))
    .where(eq(organicActivityConfig.projectId, projectId))
    .orderBy(desc(organicActivityConfig.createdAt));

  return configs.map((c) => ({
    ...c.config,
    personaName: c.personaName,
    personaAvatar: c.personaAvatar,
  }));
}

export async function getConfigById(configId: string) {
  const [config] = await db
    .select()
    .from(organicActivityConfig)
    .where(eq(organicActivityConfig.id, configId))
    .limit(1);
  return config ?? null;
}

export async function createConfig(projectId: string, data: OrganicConfigCreateInput) {
  const [config] = await db
    .insert(organicActivityConfig)
    .values({
      projectId,
      personaId: data.personaId || null,
      activityTypes: data.activityTypes,
      platform: data.platform,
      frequencyMin: data.frequencyMin,
      frequencyMax: data.frequencyMax,
      sentimentRange: data.sentimentRange,
      isActive: data.isActive,
    })
    .returning();

  return config;
}

export async function updateConfig(configId: string, data: OrganicConfigUpdateInput) {
  const [config] = await db
    .update(organicActivityConfig)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organicActivityConfig.id, configId))
    .returning();

  return config ?? null;
}

export async function deleteConfig(configId: string) {
  const [config] = await db
    .delete(organicActivityConfig)
    .where(eq(organicActivityConfig.id, configId))
    .returning();

  return config ?? null;
}

// ── Activity Logs ────────────────────────────────────────────────────

export async function getLogs(
  projectId: string,
  filters?: {
    platform?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
) {
  const conditions = [eq(organicActivityLog.projectId, projectId)];
  if (filters?.platform) conditions.push(eq(organicActivityLog.platform, filters.platform));
  if (filters?.status) conditions.push(eq(organicActivityLog.status, filters.status));

  const logs = await db
    .select({
      log: organicActivityLog,
      personaName: personas.name,
      personaAvatar: personas.avatarUrl,
    })
    .from(organicActivityLog)
    .innerJoin(personas, eq(organicActivityLog.personaId, personas.id))
    .where(and(...conditions))
    .orderBy(desc(organicActivityLog.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);

  return logs.map((l) => ({
    ...l.log,
    personaName: l.personaName,
    personaAvatar: l.personaAvatar,
  }));
}

export async function createLog(data: {
  configId: string;
  projectId: string;
  personaId: string;
  activityType: string;
  platform: string;
  targetUrl?: string;
  targetContent?: string;
  generatedContent?: string;
  status: string;
  executedAt?: Date;
  errorMessage?: string;
}) {
  const [log] = await db
    .insert(organicActivityLog)
    .values({
      configId: data.configId,
      projectId: data.projectId,
      personaId: data.personaId,
      activityType: data.activityType,
      platform: data.platform,
      targetUrl: data.targetUrl || null,
      targetContent: data.targetContent || null,
      generatedContent: data.generatedContent || null,
      status: data.status,
      executedAt: data.executedAt || new Date(),
      errorMessage: data.errorMessage || null,
    })
    .returning();

  return log;
}
