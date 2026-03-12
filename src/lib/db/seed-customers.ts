import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { readFileSync } from "fs";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const BATCH_SIZE = 50;
const JSON_PATH = "C:/Users/kadir/Downloads/musteriler.json";

interface PersonaInput {
  name: string;
  displayName?: string;
  gender?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  language?: string;
  timezone?: string;
  bio?: string;
  personalityTraits?: string[];
  interests?: string[];
  behavioralPatterns?: Record<string, unknown>;
  activeHoursStart?: number;
  activeHoursEnd?: number;
  maxPostsPerDay?: number;
}

async function seedCustomers() {
  console.log("Reading JSON file...");
  const raw = readFileSync(JSON_PATH, "utf-8");
  const data: { personas: PersonaInput[] } = JSON.parse(raw);

  const personas = data.personas;
  console.log(`Found ${personas.length} personas in JSON file.`);

  // Get the first user from the users table
  const [firstUser] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .limit(1);

  if (!firstUser) {
    console.error("No users found in the database. Please create a user first.");
    await client.end();
    process.exit(1);
  }

  const userId = firstUser.id;
  console.log(`Using user ID: ${userId}`);

  let totalInserted = 0;
  const totalBatches = Math.ceil(personas.length / BATCH_SIZE);

  for (let i = 0; i < personas.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = personas.slice(i, i + BATCH_SIZE);

    const values = batch.map((p) => ({
      userId,
      name: p.name,
      displayName: p.displayName ?? null,
      bio: p.bio ?? null,
      gender: p.gender ?? null,
      birthDate: p.birthDate ?? null,
      country: p.country ?? null,
      city: p.city ?? null,
      language: p.language ?? "tr",
      timezone: p.timezone ?? "Europe/Istanbul",
      personalityTraits: p.personalityTraits ?? [],
      interests: p.interests ?? [],
      behavioralPatterns: p.behavioralPatterns ?? {},
      activeHoursStart: p.activeHoursStart ?? 9,
      activeHoursEnd: p.activeHoursEnd ?? 23,
      maxPostsPerDay: p.maxPostsPerDay ?? 5,
      isActive: true,
    }));

    const inserted = await db
      .insert(schema.personas)
      .values(values)
      .returning({ id: schema.personas.id });

    totalInserted += inserted.length;
    console.log(
      `Batch ${batchNum}/${totalBatches}: inserted ${inserted.length} personas (total: ${totalInserted})`
    );
  }

  console.log(`\nDone! Inserted ${totalInserted} personas total.`);
  await client.end();
}

seedCustomers().catch((err) => {
  console.error("Seed customers failed:", err);
  client.end().then(() => process.exit(1));
});
