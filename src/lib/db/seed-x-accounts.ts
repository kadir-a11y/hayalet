import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// IMPORTANT: Credentials removed from source code for security.
// Account data is already seeded in the database.
// To re-seed, provide a JSON file at SEED_X_ACCOUNTS_PATH env var with format:
// [{ name, username, password, birthDate, email, emailPassword }]
import * as fs from "fs";

const seedFilePath = process.env.SEED_X_ACCOUNTS_PATH;
if (!seedFilePath || !fs.existsSync(seedFilePath)) {
  console.error("SEED_X_ACCOUNTS_PATH env var not set or file not found.");
  console.error("Provide a JSON file with account data to seed.");
  process.exit(1);
}

const xAccounts: Array<{
  name: string;
  username: string;
  password: string;
  birthDate: string;
  email: string;
  emailPassword: string;
}> = JSON.parse(fs.readFileSync(seedFilePath, "utf-8"));

async function seedXAccounts() {
  console.log("Seeding X accounts...");

  // Get admin user
  const [adminUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "admin@hayalet.dev"))
    .limit(1);

  if (!adminUser) {
    console.error("Admin user not found! Run main seed first.");
    await client.end();
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const account of xAccounts) {
    // Check if persona already exists by name
    const [existing] = await db
      .select()
      .from(schema.personas)
      .where(eq(schema.personas.name, account.name))
      .limit(1);

    if (existing) {
      console.log(`  Skipped (exists): ${account.name}`);
      skipped++;
      continue;
    }

    // Create persona
    const [persona] = await db
      .insert(schema.personas)
      .values({
        userId: adminUser.id,
        name: account.name,

        birthDate: account.birthDate,
        language: "tr",
        country: "Türkiye",
        timezone: "Europe/Istanbul",
        isActive: true,
      })
      .returning();

    // Create social account (X/Twitter) — only if username exists
    if (account.username) {
      await db.insert(schema.socialAccounts).values({
        personaId: persona.id,
        platform: "twitter",
        platformUsername: account.username,
        platformPassword: account.password || null,
        isActive: true,
      });
    }

    // Create email account — if email exists
    if (account.email) {
      await db.insert(schema.emailAccounts).values({
        personaId: persona.id,
        provider: "hotmail",
        email: account.email,
        password: account.emailPassword || null,
        isActive: true,
      });
    }

    console.log(`  Created: ${account.name}`);
    created++;
  }

  console.log(`\nSeed complete! Created: ${created}, Skipped: ${skipped}`);
  await client.end();
}

seedXAccounts().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
