import postgres from "postgres";
import pkg from "bcryptjs";
const { hash } = pkg;

const client = postgres(process.env.DATABASE_URL);

const TEAM_DATA = {
  "kadirkurtulus@hayalet.dev": {
    title: "Proje Yöneticisi",
    responsibilities: "Proje yönetimi, yeni mimariler, stratejik kararlar",
  },
  "muratbutun@hayalet.dev": {
    title: "Veri & API Yöneticisi",
    responsibilities: "Veri akışı, API yönetimi, içerik beslemesi, monitoring işlemleri, proxy işlemleri",
  },
  "ogulcanaltas@hayalet.dev": {
    title: "Proje Tasarım & Strateji",
    responsibilities: "Bug takibi, proje tasarımı ve yönetimi, içerik strateji ve kararları, kişi API ve bağlantıları, kişilerin günlük içerik yönetimi",
  },
  "enesalmis@hayalet.dev": {
    title: "Persona & Hesap Yöneticisi",
    responsibilities: "Persona yönetimi, personalara eksiksiz eposta/telefon/email/sosyal medya hesapları, API'lerin sisteme girilmesi",
  },
};

async function run() {
  const existing = await client`SELECT id, name, email, is_admin FROM users`;
  console.log("Mevcut kullanicilar:", existing.map(u => u.name + " (" + u.email + ")"));

  // Update titles and responsibilities
  for (const [email, data] of Object.entries(TEAM_DATA)) {
    const user = existing.find(u => u.email === email);
    if (user) {
      await client`UPDATE users SET title = ${data.title}, responsibilities = ${data.responsibilities} WHERE id = ${user.id}`;
      console.log("Guncellendi:", user.name, "->", data.title);
    }
  }

  const final = await client`SELECT name, email, title, responsibilities FROM users`;
  console.log("\nSon kullanici listesi:");
  final.forEach(u => console.log("  -", u.name, "|", u.title || "-", "|", u.responsibilities || "-"));

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
