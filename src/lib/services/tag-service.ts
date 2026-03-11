import { db } from "@/lib/db";
import { tags, personaTags } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { TagCreateInput, TagUpdateInput } from "@/lib/validators/tag";

export async function getTags(userId: string) {
  return db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(desc(tags.createdAt));
}

export async function getTagById(id: string, userId: string) {
  const [tag] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .limit(1);

  return tag || null;
}

export async function createTag(userId: string, data: TagCreateInput) {
  const [tag] = await db
    .insert(tags)
    .values({
      userId,
      name: data.name,
      color: data.color,
    })
    .returning();

  return tag;
}

export async function updateTag(id: string, userId: string, data: TagUpdateInput) {
  const [tag] = await db
    .update(tags)
    .set(data)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning();

  return tag;
}

export async function deleteTag(id: string, userId: string) {
  await db.delete(personaTags).where(eq(personaTags.tagId, id));

  const [tag] = await db
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning();

  return tag;
}

export async function getTagsWithCount(userId: string) {
  const allTags = await getTags(userId);

  const counts = await db
    .select({
      tagId: personaTags.tagId,
      count: sql<number>`count(*)::int`,
    })
    .from(personaTags)
    .groupBy(personaTags.tagId);

  const countMap = new Map(counts.map((c) => [c.tagId, c.count]));

  return allTags.map((tag) => ({
    ...tag,
    personaCount: countMap.get(tag.id) || 0,
  }));
}
