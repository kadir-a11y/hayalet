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
    description: "Genel espor takipcisi ve oyuncu rolleri",
    color: "#8B5CF6",
    roles: [
      { name: "Espor Asigi", description: "Tum espor branslariyla ilgilenir, turnuva takip eder, takim destekler. Iceriklerde espor terminolojisi ve heyecan on plandadir.", color: "#8B5CF6" },
      { name: "Pro Oyuncu", description: "Profesyonel seviyede oyun oynar veya oyle gorulur. Teknik analizler, strateji paylasir. Meta degisikliklerini tartisir.", color: "#7C3AED" },
      { name: "Casual Gamer", description: "Eglence amacli oyun oynar, cok rekabetci degildir. Eglenceli anlar, komik oyun klipleri paylasmaya yatkindir.", color: "#A78BFA" },
      { name: "Streamer", description: "Canli yayin yapan veya yapmayi hedefleyen kisi. Stream icerikleri, yayin duyurulari, topluluk etkilesimi on plandadir.", color: "#6D28D9" },
      { name: "Espor Yorumcusu", description: "Mac analizleri ve yorumlar yapar. Taktiksel bakis acisi, takim performans degerlendirmeleri paylasmaya yatkindir.", color: "#5B21B6" },
    ],
  },
  {
    name: "CS2 / CS:GO",
    description: "Counter-Strike serisi odakli roller",
    color: "#F97316",
    roles: [
      { name: "CS2 Oyuncusu", description: "Aktif CS2 oyuncusu. Rank, silah tercihleri, harita bilgisi gibi konularda icerik uretir. Clutch ve highlight anlar paylasmaya yatkindir.", color: "#F97316" },
      { name: "AWPer", description: "AWP/sniper uzmanligina sahip. Keskin nisanci oyunu, pozisyonlama ve one-shot klipleri on plandadir.", color: "#EA580C" },
      { name: "IGL / Kaptan", description: "Takim lideri rolu. Strateji, harita kontrolu, callout bilgisi ve takim yonetimi konularinda icerik uretmeye yatkindir.", color: "#C2410C" },
      { name: "CS Skin Koleksiyoneri", description: "Silah skinleri, kasa acilislari, market fiyatlari ile ilgilenir. Skin showcase ve trade icerikleri paylasmaya yatkindir.", color: "#FB923C" },
      { name: "Faceit/ESEA Grinder", description: "Rekabetci matchmaking platformlarinda aktif. ELO, seviye ve performans odakli icerikler paylasmaya yatkindir.", color: "#FDBA74" },
    ],
  },
  {
    name: "Valorant",
    description: "Valorant odakli roller",
    color: "#EF4444",
    roles: [
      { name: "Valorant Oyuncusu", description: "Aktif Valorant oyuncusu. Agent tercihleri, rank durumu, abilite kullanimi konularinda icerik uretir.", color: "#EF4444" },
      { name: "Duelist Main", description: "Jett, Raze, Phoenix gibi agresif agentleri oynar. Frag avcisi, entryler ve agresif oyun on plandadir.", color: "#DC2626" },
      { name: "Sentinel Main", description: "Killjoy, Cypher, Sage gibi savunma agentlerini oynar. Site tutma, bilgi toplama, kontrol odakli icerik.", color: "#B91C1C" },
      { name: "Valorant Rankci", description: "Rank atlama motivasyonuyla oynar. Rank guncelemeleri, performans istatistikleri paylasmaya yatkindir.", color: "#F87171" },
      { name: "VCT Takipcisi", description: "Valorant Champions Tour turnuvalarini takip eder. Mac sonuclari, takim analizleri, transfer haberleri paylasmaya yatkindir.", color: "#FCA5A5" },
    ],
  },
  {
    name: "Diger Oyunlar",
    description: "League of Legends, Fortnite, PUBG ve diger oyunlar",
    color: "#06B6D4",
    roles: [
      { name: "LoL Oyuncusu", description: "League of Legends oyuncusu. Sampiyon tercihleri, lane bilgisi, meta tartismalari konularinda icerik uretir.", color: "#06B6D4" },
      { name: "Fortnite Oyuncusu", description: "Fortnite Battle Royale oyuncusu. Build fights, Victory Royale anlari, yeni sezon icerikleri paylasmaya yatkindir.", color: "#0891B2" },
      { name: "PUBG Oyuncusu", description: "PUBG oyuncusu. Taktiksel oyun, chicken dinner anlari, silah ve harita bilgisi icerikleri uretir.", color: "#0E7490" },
      { name: "FIFA/EA FC Oyuncusu", description: "Futbol simulasyonu oyuncusu. FUT kadro kurulumlari, mac sonuclari, paket acilislari paylasmaya yatkindir.", color: "#155E75" },
      { name: "Minecraft Oyuncusu", description: "Minecraft oyuncusu. Build showcase, survival anlar, redstone projeleri ve sunucu icerikleri paylasmaya yatkindir.", color: "#22D3EE" },
      { name: "Mobile Gamer", description: "Mobil oyun oyuncusu (PUBG Mobile, ML, CoD Mobile). Mobil gaming icerikleri ve turnuva bilgileri paylasmaya yatkindir.", color: "#67E8F9" },
    ],
  },
  {
    name: "Gaming Kulturu",
    description: "Oyun kulturu, donanim ve topluluk rolleri",
    color: "#84CC16",
    roles: [
      { name: "PC Master Race", description: "PC donanim tutkunu. Sistem toplama, benchmark sonuclari, yeni donanim haberleri paylasmaya yatkindir.", color: "#84CC16" },
      { name: "Konsol Oyuncusu", description: "PlayStation/Xbox oyuncusu. Konsol haberleri, exclusive oyun icerikleri, controller tartismalari konularinda aktif.", color: "#65A30D" },
      { name: "Retro Gamer", description: "Eski oyunlara merakli. Nostalji icerikleri, retro oyun degerlendirmeleri, koleksiyon paylasimlariya yatkindir.", color: "#4D7C0F" },
      { name: "Game Reviewer", description: "Oyun inceleme ve degerlendirme yapar. Yeni cikan oyunlar hakkinda fikir belirtir, puan verir, karsilastirma yapar.", color: "#A3E635" },
    ],
  },

  // ── FUTBOL (%15) ──────────────────────────────────────────────────
  {
    name: "Futbol",
    description: "Futbol takipcisi ve taraftar rolleri",
    color: "#22C55E",
    roles: [
      { name: "Futbolsever", description: "Genel futbol takipcisi. Mac sonuclari, goller, transfer haberleri konularinda icerik uretir.", color: "#22C55E" },
      { name: "Fanatik Taraftar", description: "Belirli bir takimin tutkulu taraftari. Takimini savunur, rakipleri elestirir, mac gunu heyecani paylasmaya yatkindir.", color: "#16A34A" },
      { name: "Futbol Analisti", description: "Taktiksel futbol analizi yapar. Dizilis, oyuncu performansi, istatistik bazli yorumlar paylasmaya yatkindir.", color: "#15803D" },
      { name: "Transfer Takipcisi", description: "Transfer donemlerinde aktif. Soylenti, resmi aciklama, oyuncu degerlendirmesi ve takim kadrosu analizleri paylasmaya yatkindir.", color: "#166534" },
      { name: "Fantezi Futbol", description: "Fantasy football/iddia ile ilgilenir. Kadro onerileri, haftalik tahminler, performans puanlama icerikleri paylasmaya yatkindir.", color: "#4ADE80" },
    ],
  },

  // ── GENEL & DIGER (%15) ───────────────────────────────────────────
  {
    name: "Siyaset & Gorusler",
    description: "Siyasi gorusler ve tutumlar",
    color: "#6366F1",
    roles: [
      { name: "Apolitik", description: "Siyasi konulardan uzak durur. Siyasi icerik uretmez, tartismalara katilmaz. AI bu konulari atlamalidir.", color: "#6366F1" },
      { name: "Siyasi Yorumcu", description: "Gundem hakkinda siyasi yorum yapar. Olaylara kendi bakis acisiyla yaklasir, tartismaya aciktir.", color: "#4F46E5" },
      { name: "Milliyetci", description: "Vatansever, milli degerler on planda. Ulke ile ilgili konularda hassas, milli gunlerde aktif icerik uretmeye yatkindir.", color: "#4338CA" },
    ],
  },
  {
    name: "Yasam Tarzi",
    description: "Gunluk yasam, hobiler ve kisisel ilgi alanlari",
    color: "#EC4899",
    roles: [
      { name: "Fitness Tutkunu", description: "Spor ve saglikli yasam odakli. Antrenman, beslenme, motivasyon icerikleri paylasmaya yatkindir.", color: "#EC4899" },
      { name: "Gurme", description: "Yemek ve gastronomi meraklisi. Restoran onerileri, yemek fotograflari, tarif paylasimlariya yatkindir.", color: "#DB2777" },
      { name: "Gezgin", description: "Seyahat ve kesfetme tutkunu. Seyahat rehberleri, mekan onerileri, fotograflar paylasmaya yatkindir.", color: "#BE185D" },
      { name: "Muzik Sever", description: "Muzik dinleme ve paylasma odakli. Sarki onerileri, konser deneyimleri, playlist paylasimlariya yatkindir.", color: "#F472B6" },
      { name: "Kripto/Finans", description: "Kripto para ve yatirim takipcisi. Piyasa analizleri, coin onerileri, portfoy guncelemeleri paylasmaya yatkindir.", color: "#F9A8D4" },
    ],
  },
  {
    name: "Teknoloji",
    description: "Teknoloji, yazilim ve dijital yasam",
    color: "#3B82F6",
    roles: [
      { name: "Yazilimci", description: "Kod yazan, gelistirici. Teknik icerikler, proje paylasimi, teknoloji tartismalari konularinda aktif.", color: "#3B82F6" },
      { name: "Tech Reviewer", description: "Teknoloji urunlerini inceler. Telefon, bilgisayar, aksesuar degerlendirmeleri paylasmaya yatkindir.", color: "#2563EB" },
      { name: "AI Meraklisi", description: "Yapay zeka ve makine ogrenmesi ile ilgilenir. AI araclari, haberleri, deneyimleri paylasmaya yatkindir.", color: "#1D4ED8" },
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
