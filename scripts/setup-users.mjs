import postgres from "postgres";
import pkg from "bcryptjs";
const { hash } = pkg;

const client = postgres(process.env.DATABASE_URL);

async function run() {
  const existing = await client`SELECT id, name, email, is_admin FROM users`;
  console.log("Mevcut kullanicilar:", existing.map(u => u.name + " (" + u.email + ")"));

  const adminUser = existing.find(u => u.email === "admin@hayalet.dev");
  if (adminUser) {
    await client`UPDATE users SET name = ${"Kadir Kurtuluş"}, email = ${"kadirkurtulus@hayalet.dev"}, is_admin = true WHERE id = ${adminUser.id}`;
    console.log("Admin guncellendi -> Kadir Kurtulus");
  }

  const enesUser = existing.find(u => u.name && u.name.toLowerCase().includes("enes"));
  if (enesUser) {
    await client`UPDATE users SET name = ${"Enes Almış"}, email = ${"enesalmis@hayalet.dev"}, is_admin = true WHERE id = ${enesUser.id}`;
    console.log("Enes guncellendi -> Enes Almis");
  }

  const pw = await hash(process.env.ADMIN_PASSWORD || "Hayalet2026!Secure", 12);

  const ogulcanExists = existing.find(u => u.email === "ogulcanaltas@hayalet.dev");
  if (!ogulcanExists) {
    await client`INSERT INTO users (name, email, password_hash, is_admin) VALUES (${"Oğulcan Altaş"}, ${"ogulcanaltas@hayalet.dev"}, ${pw}, true)`;
    console.log("Ogulcan Altas eklendi");
  }

  const muratExists = existing.find(u => u.email === "muratbutun@hayalet.dev");
  if (!muratExists) {
    await client`INSERT INTO users (name, email, password_hash, is_admin) VALUES (${"Murat Bütün"}, ${"muratbutun@hayalet.dev"}, ${pw}, true)`;
    console.log("Murat Butun eklendi");
  }

  await client`UPDATE users SET is_admin = true`;
  console.log("Tum kullanicilar admin yapildi");

  const final = await client`SELECT name, email, is_admin FROM users`;
  console.log("\nSon kullanici listesi:");
  final.forEach(u => console.log("  -", u.name, "(" + u.email + ") admin=" + u.is_admin));

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
