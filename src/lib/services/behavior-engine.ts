import { db } from "@/lib/db";
import { personas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get the current hour in a persona's timezone.
 */
function getLocalHour(timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    return parseInt(formatter.format(new Date()), 10);
  } catch {
    return new Date().getUTCHours();
  }
}

/**
 * Check if a persona can post right now based on active hours.
 */
export async function canPostNow(personaId: string): Promise<{
  allowed: boolean;
  reason?: string;
  nextSlot?: Date;
}> {
  const [persona] = await db
    .select({
      timezone: personas.timezone,
      activeHoursStart: personas.activeHoursStart,
      activeHoursEnd: personas.activeHoursEnd,
      isActive: personas.isActive,
    })
    .from(personas)
    .where(eq(personas.id, personaId))
    .limit(1);

  if (!persona) {
    return { allowed: false, reason: "Persona not found" };
  }

  if (!persona.isActive) {
    return { allowed: false, reason: "Persona is inactive" };
  }

  const tz = persona.timezone || "Europe/Istanbul";
  const currentHour = getLocalHour(tz);
  const start = persona.activeHoursStart ?? 9;
  const end = persona.activeHoursEnd ?? 23;

  if (currentHour >= start && currentHour < end) {
    return { allowed: true };
  }

  // Calculate next active slot
  const now = new Date();
  const hoursUntilActive = start > currentHour
    ? start - currentHour
    : 24 - currentHour + start;

  const nextSlot = new Date(now.getTime() + hoursUntilActive * 60 * 60 * 1000);

  return {
    allowed: false,
    reason: `Outside active hours (${start}:00-${end}:00, current: ${currentHour}:00)`,
    nextSlot,
  };
}

/**
 * Check if a persona can post today based on daily limit.
 */
export async function canPostToday(personaId: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const [persona] = await db
    .select({
      maxPostsPerDay: personas.maxPostsPerDay,
      todayPostCount: personas.todayPostCount,
      todayPostCountResetAt: personas.todayPostCountResetAt,
    })
    .from(personas)
    .where(eq(personas.id, personaId))
    .limit(1);

  if (!persona) {
    return { allowed: false, remaining: 0 };
  }

  const maxPerDay = persona.maxPostsPerDay ?? 5;
  let count = persona.todayPostCount ?? 0;

  // Reset counter if it's a new day
  const resetAt = persona.todayPostCountResetAt;
  const now = new Date();
  if (!resetAt || resetAt.toDateString() !== now.toDateString()) {
    count = 0;
    await db
      .update(personas)
      .set({ todayPostCount: 0, todayPostCountResetAt: now })
      .where(eq(personas.id, personaId));
  }

  const remaining = Math.max(0, maxPerDay - count);

  return {
    allowed: remaining > 0,
    remaining,
  };
}

/**
 * Get the next available posting slot for a persona.
 * Combines active hours + daily limit check + random jitter.
 */
export async function getNextAvailableSlot(personaId: string): Promise<Date | null> {
  const hourCheck = await canPostNow(personaId);
  const dayCheck = await canPostToday(personaId);

  if (!dayCheck.allowed) {
    // Daily limit reached — next slot is tomorrow at activeHoursStart
    const [persona] = await db
      .select({ activeHoursStart: personas.activeHoursStart, timezone: personas.timezone })
      .from(personas)
      .where(eq(personas.id, personaId))
      .limit(1);

    if (!persona) return null;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(persona.activeHoursStart ?? 9, 0, 0, 0);

    // Add 1-15 min jitter
    const jitter = Math.floor(Math.random() * 15) * 60 * 1000;
    return new Date(tomorrow.getTime() + jitter);
  }

  if (!hourCheck.allowed && hourCheck.nextSlot) {
    // Add 1-15 min jitter
    const jitter = Math.floor(Math.random() * 15) * 60 * 1000;
    return new Date(hourCheck.nextSlot.getTime() + jitter);
  }

  // Can post now — add small jitter (1-5 min)
  const jitter = Math.floor(Math.random() * 5 + 1) * 60 * 1000;
  return new Date(Date.now() + jitter);
}

/**
 * Anti-coordination: assign staggered times for multiple personas posting about the same topic.
 * Returns a map of personaId -> scheduled Date.
 */
export function checkCoordination(
  personaIds: string[],
  _topic: string
): Map<string, Date> {
  const schedule = new Map<string, Date>();

  // Shuffle persona order so it's not always the same one first
  const shuffled = [...personaIds].sort(() => Math.random() - 0.5);

  let baseTime = Date.now();

  for (const personaId of shuffled) {
    // 30 min to 3 hours between each persona
    const gap = (30 + Math.floor(Math.random() * 150)) * 60 * 1000;
    baseTime += gap;
    schedule.set(personaId, new Date(baseTime));
  }

  return schedule;
}

/**
 * Increment today's post count and update lastPostedAt.
 */
export async function incrementPostCount(personaId: string): Promise<void> {
  const now = new Date();

  const [persona] = await db
    .select({ todayPostCountResetAt: personas.todayPostCountResetAt, todayPostCount: personas.todayPostCount })
    .from(personas)
    .where(eq(personas.id, personaId))
    .limit(1);

  let newCount = (persona?.todayPostCount ?? 0) + 1;

  // Reset if new day
  const resetAt = persona?.todayPostCountResetAt;
  if (!resetAt || resetAt.toDateString() !== now.toDateString()) {
    newCount = 1;
  }

  await db
    .update(personas)
    .set({
      todayPostCount: newCount,
      todayPostCountResetAt: now,
      lastPostedAt: now,
      updatedAt: now,
    })
    .where(eq(personas.id, personaId));
}
