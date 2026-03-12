import { db } from "@/lib/db";
import { campaigns, contentItems, personas, personaTags } from "@/lib/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import type { CampaignCreateInput, CampaignUpdateInput } from "@/lib/validators/campaign";

export async function getCampaigns(userId: string, isAdmin = false) {
  const query = db
    .select()
    .from(campaigns);

  if (!isAdmin) {
    return query.where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));
  }
  return query.orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: string, userId: string, isAdmin = false) {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(isAdmin ? eq(campaigns.id, id) : and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
    .limit(1);

  if (!campaign) return null;

  const contentStats = await db
    .select({
      status: contentItems.status,
      count: sql<number>`count(*)::int`,
    })
    .from(contentItems)
    .where(eq(contentItems.campaignId, id))
    .groupBy(contentItems.status);

  return { ...campaign, contentStats };
}

export async function createCampaign(userId: string, data: CampaignCreateInput) {
  const [campaign] = await db
    .insert(campaigns)
    .values({
      userId,
      name: data.name,
      description: data.description,
      targetTagIds: data.targetTagIds,
      contentTemplate: data.contentTemplate,
      platform: data.platform,
      scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : null,
      scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : null,
      settings: data.settings,
    })
    .returning();

  return campaign;
}

export async function updateCampaign(
  id: string,
  userId: string,
  data: CampaignUpdateInput,
  isAdmin = false
) {
  const [campaign] = await db
    .update(campaigns)
    .set({
      ...data,
      scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : undefined,
      scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : undefined,
      updatedAt: new Date(),
    })
    .where(isAdmin ? eq(campaigns.id, id) : and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
    .returning();

  return campaign;
}

export async function deleteCampaign(id: string, userId: string, isAdmin = false) {
  const [campaign] = await db
    .delete(campaigns)
    .where(isAdmin ? eq(campaigns.id, id) : and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
    .returning();

  return campaign;
}

export async function resolvePersonasForCampaign(targetTagIds: string[]) {
  if (targetTagIds.length === 0) return [];

  const matchingPersonaIds = await db
    .selectDistinct({ personaId: personaTags.personaId })
    .from(personaTags)
    .where(inArray(personaTags.tagId, targetTagIds));

  if (matchingPersonaIds.length === 0) return [];

  const matchedPersonas = await db
    .select()
    .from(personas)
    .where(
      and(
        inArray(
          personas.id,
          matchingPersonaIds.map((p) => p.personaId)
        ),
        eq(personas.isActive, true)
      )
    );

  return matchedPersonas;
}
