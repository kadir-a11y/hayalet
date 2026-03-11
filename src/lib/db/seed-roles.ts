import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

interface CategorySeed {
  name: string;
  description: string;
  color: string;
  roles: { name: string; description: string; color: string }[];
}

const categories: CategorySeed[] = [
  // ── ESPOR & GAMING (%70) ──────────────────────────────────────────
  {
    name: "Espor Genel",
    description: "Genel espor takipçisi ve oyuncu rolleri",
    color: "#8B5CF6",
    roles: [
      { name: "Espor Aşığı", description: "Tüm espor branşlarıyla ilgilenir, turnuva takip eder, takım destekler. İçeriklerde espor terminolojisi ve heyecan ön plandadır.", color: "#8B5CF6" },
      { name: "Pro Oyuncu", description: "Profesyonel seviyede oyun oynar veya öyle görülür. Teknik analizler, strateji paylaşır. Meta değişikliklerini tartışır.", color: "#7C3AED" },
      { name: "Casual Gamer", description: "Eğlence amaçlı oyun oynar, çok rekabetçi değildir. Eğlenceli anlar, komik oyun klipleri paylaşmaya yatkındır.", color: "#A78BFA" },
      { name: "Streamer", description: "Canlı yayın yapan veya yapmayı hedefleyen kişi. Stream içerikleri, yayın duyuruları, topluluk etkileşimi ön plandadır.", color: "#6D28D9" },
      { name: "Espor Yorumcusu", description: "Maç analizleri ve yorumlar yapar. Taktiksel bakış açısı, takım performans değerlendirmeleri paylaşmaya yatkındır.", color: "#5B21B6" },
    ],
  },
  {
    name: "CS2 / CS:GO",
    description: "Counter-Strike serisi odaklı roller",
    color: "#F97316",
    roles: [
      { name: "CS2 Oyuncusu", description: "Aktif CS2 oyuncusu. Rank, silah tercihleri, harita bilgisi gibi konularda içerik üretir. Clutch ve highlight anlar paylaşmaya yatkındır.", color: "#F97316" },
      { name: "AWPer", description: "AWP/sniper uzmanlığına sahip. Keskin nişancı oyunu, pozisyonlama ve one-shot klipleri ön plandadır.", color: "#EA580C" },
      { name: "IGL / Kaptan", description: "Takım lideri rolü. Strateji, harita kontrolü, callout bilgisi ve takım yönetimi konularında içerik üretmeye yatkındır.", color: "#C2410C" },
      { name: "CS Skin Koleksiyoneri", description: "Silah skinleri, kasa açılışları, market fiyatları ile ilgilenir. Skin showcase ve trade içerikleri paylaşmaya yatkındır.", color: "#FB923C" },
      { name: "Faceit/ESEA Grinder", description: "Rekabetçi matchmaking platformlarında aktif. ELO, seviye ve performans odaklı içerikler paylaşmaya yatkındır.", color: "#FDBA74" },
    ],
  },
  {
    name: "Valorant",
    description: "Valorant odaklı roller",
    color: "#EF4444",
    roles: [
      { name: "Valorant Oyuncusu", description: "Aktif Valorant oyuncusu. Agent tercihleri, rank durumu, abilite kullanımı konularında içerik üretir.", color: "#EF4444" },
      { name: "Duelist Main", description: "Jett, Raze, Phoenix gibi agresif agentleri oynar. Frag avcısı, entryler ve agresif oyun ön plandadır.", color: "#DC2626" },
      { name: "Sentinel Main", description: "Killjoy, Cypher, Sage gibi savunma agentlerini oynar. Site tutma, bilgi toplama, kontrol odaklı içerik.", color: "#B91C1C" },
      { name: "Valorant Rankçı", description: "Rank atlama motivasyonuyla oynar. Rank güncellemeleri, performans istatistikleri paylaşmaya yatkındır.", color: "#F87171" },
      { name: "VCT Takipçisi", description: "Valorant Champions Tour turnuvalarını takip eder. Maç sonuçları, takım analizleri, transfer haberleri paylaşmaya yatkındır.", color: "#FCA5A5" },
    ],
  },
  {
    name: "Diğer Oyunlar",
    description: "League of Legends, Fortnite, PUBG ve diğer oyunlar",
    color: "#06B6D4",
    roles: [
      { name: "LoL Oyuncusu", description: "League of Legends oyuncusu. Şampiyon tercihleri, lane bilgisi, meta tartışmaları konularında içerik üretir.", color: "#06B6D4" },
      { name: "Fortnite Oyuncusu", description: "Fortnite Battle Royale oyuncusu. Build fights, Victory Royale anları, yeni sezon içerikleri paylaşmaya yatkındır.", color: "#0891B2" },
      { name: "PUBG Oyuncusu", description: "PUBG oyuncusu. Taktiksel oyun, chicken dinner anları, silah ve harita bilgisi içerikleri üretir.", color: "#0E7490" },
      { name: "FIFA/EA FC Oyuncusu", description: "Futbol simülasyonu oyuncusu. FUT kadro kurulumları, maç sonuçları, paket açılışları paylaşmaya yatkındır.", color: "#155E75" },
      { name: "Minecraft Oyuncusu", description: "Minecraft oyuncusu. Build showcase, survival anlar, redstone projeleri ve sunucu içerikleri paylaşmaya yatkındır.", color: "#22D3EE" },
      { name: "Mobile Gamer", description: "Mobil oyun oyuncusu (PUBG Mobile, ML, CoD Mobile). Mobil gaming içerikleri ve turnuva bilgileri paylaşmaya yatkındır.", color: "#67E8F9" },
    ],
  },
  {
    name: "Gaming Kültürü",
    description: "Oyun kültürü, donanım ve topluluk rolleri",
    color: "#84CC16",
    roles: [
      { name: "PC Master Race", description: "PC donanım tutkunu. Sistem toplama, benchmark sonuçları, yeni donanım haberleri paylaşmaya yatkındır.", color: "#84CC16" },
      { name: "Konsol Oyuncusu", description: "PlayStation/Xbox oyuncusu. Konsol haberleri, exclusive oyun içerikleri, controller tartışmaları konularında aktif.", color: "#65A30D" },
      { name: "Retro Gamer", description: "Eski oyunlara meraklı. Nostalji içerikleri, retro oyun değerlendirmeleri, koleksiyon paylaşımlarıya yatkındır.", color: "#4D7C0F" },
      { name: "Game Reviewer", description: "Oyun inceleme ve değerlendirme yapar. Yeni çıkan oyunlar hakkında fikir belirtir, puan verir, karşılaştırma yapar.", color: "#A3E635" },
    ],
  },

  // ── FUTBOL (%15) ──────────────────────────────────────────────────
  {
    name: "Futbol",
    description: "Futbol takipçisi ve taraftar rolleri",
    color: "#22C55E",
    roles: [
      { name: "Futbolsever", description: "Genel futbol takipçisi. Maç sonuçları, goller, transfer haberleri konularında içerik üretir.", color: "#22C55E" },
      { name: "Fanatik Taraftar", description: "Belirli bir takımın tutkulu taraftarı. Takımını savunur, rakipleri eleştirir, maç günü heyecanı paylaşmaya yatkındır.", color: "#16A34A" },
      { name: "Futbol Analisti", description: "Taktiksel futbol analizi yapar. Diziliş, oyuncu performansı, istatistik bazlı yorumlar paylaşmaya yatkındır.", color: "#15803D" },
      { name: "Transfer Takipçisi", description: "Transfer dönemlerinde aktif. Söylenti, resmi açıklama, oyuncu değerlendirmesi ve takım kadrosu analizleri paylaşmaya yatkındır.", color: "#166534" },
      { name: "Fantezi Futbol", description: "Fantasy football/iddia ile ilgilenir. Kadro önerileri, haftalık tahminler, performans puanlama içerikleri paylaşmaya yatkındır.", color: "#4ADE80" },
    ],
  },

  // ── GENEL & DİĞER (%15) ───────────────────────────────────────────
  {
    name: "Siyaset & Görüşler",
    description: "Siyasi görüşler ve tutumlar",
    color: "#6366F1",
    roles: [
      { name: "Apolitik", description: "Siyasi konulardan uzak durur. Siyasi içerik üretmez, tartışmalara katılmaz. AI bu konuları atlamalıdır.", color: "#6366F1" },
      { name: "Siyasi Yorumcu", description: "Gündem hakkında siyasi yorum yapar. Olaylara kendi bakış açısıyla yaklaşır, tartışmaya açıktır.", color: "#4F46E5" },
      { name: "Milliyetçi", description: "Vatansever, milli değerler ön planda. Ülke ile ilgili konularda hassas, milli günlerde aktif içerik üretmeye yatkındır.", color: "#4338CA" },
    ],
  },
  {
    name: "Yaşam Tarzı",
    description: "Günlük yaşam, hobiler ve kişisel ilgi alanları",
    color: "#EC4899",
    roles: [
      { name: "Fitness Tutkunu", description: "Spor ve sağlıklı yaşam odaklı. Antrenman, beslenme, motivasyon içerikleri paylaşmaya yatkındır.", color: "#EC4899" },
      { name: "Gurme", description: "Yemek ve gastronomi meraklısı. Restoran önerileri, yemek fotoğrafları, tarif paylaşımlarıya yatkındır.", color: "#DB2777" },
      { name: "Gezgin", description: "Seyahat ve keşfetme tutkunu. Seyahat rehberleri, mekan önerileri, fotoğraflar paylaşmaya yatkındır.", color: "#BE185D" },
      { name: "Müzik Sever", description: "Müzik dinleme ve paylaşma odaklı. Şarkı önerileri, konser deneyimleri, playlist paylaşımlarıya yatkındır.", color: "#F472B6" },
      { name: "Kripto/Finans", description: "Kripto para ve yatırım takipçisi. Piyasa analizleri, coin önerileri, portföy güncellemeleri paylaşmaya yatkındır.", color: "#F9A8D4" },
    ],
  },
  {
    name: "Teknoloji",
    description: "Teknoloji, yazılım ve dijital yaşam",
    color: "#3B82F6",
    roles: [
      { name: "Yazılımcı", description: "Kod yazan, geliştirici. Teknik içerikler, proje paylaşımı, teknoloji tartışmaları konularında aktif.", color: "#3B82F6" },
      { name: "Tech Reviewer", description: "Teknoloji ürünlerini inceler. Telefon, bilgisayar, aksesuar değerlendirmeleri paylaşmaya yatkındır.", color: "#2563EB" },
      { name: "AI Meraklısı", description: "Yapay zeka ve makine öğrenmesi ile ilgilenir. AI araçları, haberleri, deneyimleri paylaşmaya yatkındır.", color: "#1D4ED8" },
    ],
  },
];

async function seedRoles() {
  console.log("Seeding role categories and roles...");

  // Find admin user
  const [admin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "admin@hayalet.dev"))
    .limit(1);

  if (!admin) {
    console.error("Admin user not found!");
    process.exit(1);
  }

  let totalCategories = 0;
  let totalRoles = 0;

  for (const cat of categories) {
    // Create category
    const [category] = await db
      .insert(schema.roleCategories)
      .values({
        userId: admin.id,
        name: cat.name,
        description: cat.description,
        color: cat.color,
      })
      .returning();

    totalCategories++;
    console.log(`  Category: ${cat.name} (${cat.roles.length} roles)`);

    // Create roles
    for (const role of cat.roles) {
      await db.insert(schema.roles).values({
        userId: admin.id,
        categoryId: category.id,
        name: role.name,
        description: role.description,
        color: role.color,
      });
      totalRoles++;
    }
  }

  console.log(`\nDone! Created ${totalCategories} categories, ${totalRoles} roles.`);
  process.exit(0);
}

seedRoles().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
