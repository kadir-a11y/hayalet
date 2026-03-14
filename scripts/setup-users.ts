import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../src/lib/db/schema/users";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

const TEAM = [
  {
    name: "Kadir Kurtuluş",
    email: "kadirkurtulus@hayalet.dev",
    isAdmin: true,
  },
  {
    name: "Enes Almış",
    email: "enesalmis@hayalet.dev",
    isAdmin: true,
  },
  {
    name: "Oğulcan Altaş",
    email: "ogulcanaltas@hayalet.dev",
    isAdmin: true,
  },
  {
    name: "Murat Bütün",
    email: "muratbutun@hayalet.dev",
    isAdmin: true,
  },
];

async function setupUsers() {
  const defaultPassword = process.env.ADMIN_PASSWORD || "Hayalet2026!Secure";
  const passwordHash = await hash(defaultPassword, 12);

  // Update existing admin user to Kadir Kurtuluş
  const existingUsers = await db.select().from(users);
  console.log("Mevcut kullanıcılar:", existingUsers.map(u => `${u.name} (${u.email})`));

  // Find admin user (first user or admin@hayalet.dev)
  const adminUser = existingUsers.find(u => u.email === "admin@hayalet.dev");
  if (adminUser) {
    await db.update(users)
      .set({ name: "Kadir Kurtuluş", email: "kadirkurtulus@hayalet.dev", isAdmin: true })
      .where(eq(users.id, adminUser.id));
    console.log(`✅ Admin güncellendi: ${adminUser.email} → kadirkurtulus@hayalet.dev`);
  }

  // Update Enes if exists with wrong name
  const enesUser = existingUsers.find(u => u.email?.includes("enes") || u.name?.toLowerCase().includes("enes"));
  if (enesUser && enesUser.name !== "Enes Almış") {
    await db.update(users)
      .set({ name: "Enes Almış", email: "enesalmis@hayalet.dev", isAdmin: true })
      .where(eq(users.id, enesUser.id));
    console.log(`✅ Enes güncellendi: ${enesUser.name} → Enes Almış`);
  }

  // Add missing users
  for (const member of TEAM) {
    const exists = existingUsers.find(u => u.email === member.email) ||
                   (member.name === "Kadir Kurtuluş" && adminUser) ||
                   (member.name === "Enes Almış" && enesUser);
    if (!exists) {
      const [created] = await db.insert(users).values({
        name: member.name,
        email: member.email,
        passwordHash,
        isAdmin: member.isAdmin,
      }).returning();
      console.log(`✅ Yeni kullanıcı eklendi: ${created.name} (${created.email})`);
    }
  }

  // Make all users admin
  await db.update(users).set({ isAdmin: true });
  console.log("✅ Tüm kullanıcılar admin yapıldı");

  // Final list
  const finalUsers = await db.select({ id: users.id, name: users.name, email: users.email, isAdmin: users.isAdmin }).from(users);
  console.log("\n📋 Son kullanıcı listesi:");
  finalUsers.forEach(u => console.log(`  - ${u.name} (${u.email}) admin=${u.isAdmin}`));

  await client.end();
}

setupUsers().catch(err => {
  console.error("Hata:", err);
  process.exit(1);
});
