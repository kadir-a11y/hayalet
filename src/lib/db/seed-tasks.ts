import { db } from "./index";
import { teamTasks } from "./schema";

const TASKS = [
  // Yapılacak
  { taskCode: "MON-2", title: "Monitoring Worker Altyapısı", description: "BullMQ worker'lar — twitterScanQueue, monitoringQueue, relevanceScoringQueue consume edecek. Murat'ın twitter-scan pattern'i üzerine inşa edilecek.", status: "pending", priority: "high", phase: "Faz 7: Altyapı Genişletme", category: "dev" },
  { taskCode: "MON-3", title: "Monitoring API Endpoints", description: "Topic CRUD, source yönetimi, discovered items listeleme, auto-post rules CRUD. DB tabloları zaten mevcut.", status: "pending", priority: "high", phase: "Faz 7: Altyapı Genişletme", category: "dev", dependency: "API bağlama gerekli" },
  { taskCode: "AI-1", title: "Persona-Aware Prompt Mühendisliği", description: "Tüm persona bilgilerini (traits, interests, tone, emoji style, konum, dil) otomatik AI prompt'una yedir. Karakter tutarlılığı için system prompt şablonları.", status: "pending", priority: "high", phase: "Faz 9: Gelişmiş AI & İçerik", category: "dev" },
  { taskCode: "AI-2", title: "Platform-Spesifik İçerik Formatlama", description: "Twitter 280 char limiti, Instagram hashtag optimizasyonu, LinkedIn profesyonel ton. Her platform için otomatik içerik uyarlama.", status: "pending", priority: "normal", phase: "Faz 9: Gelişmiş AI & İçerik", category: "dev" },
  { taskCode: "AI-3", title: "Few-Shot Learning — Örnek Gönderilerden Öğrenme", description: "Personanın önceki gönderilerini prompt'a örnek ekle. 3-5 örnek gönderiyle yazım stili ve ton tutarlılığı.", status: "pending", priority: "normal", phase: "Faz 9: Gelişmiş AI & İçerik", category: "dev" },
  { taskCode: "OTO-1", title: "Zamanlanmış Kampanya Tetikleme (Cron Jobs)", description: "Cron-based kampanya zamanlama. Tekrarlayan kampanyalar (her hafta, her ay). BullMQ Job Scheduler entegrasyonu.", status: "pending", priority: "normal", phase: "Faz 10: Otomasyon", category: "dev" },
  { taskCode: "OTO-2", title: "Hesap Durumu Otomatik Kontrol Cron'u", description: "Günlük cron ile sosyal hesapların profil sayfalarına gidip açık/kapalı/askıda durumunu kontrol. accountStatus otomatik güncelleme.", status: "pending", priority: "normal", phase: "Faz 10: Otomasyon", category: "dev", dependency: "API bağlama gerekli" },
  { taskCode: "SEC-1", title: "Proxy Rotasyonu ve IP Havuzu Yönetimi", description: "Otomatik proxy rotasyonu. Residential, datacenter, mobile proxy tipleri. Ülke bazlı IP atama. BrightData/Oxylabs entegrasyonu.", status: "pending", priority: "normal", phase: "Faz 12: Güvenlik & Anti-Detection", category: "dev" },
  { taskCode: "SEC-2", title: "Platform Ban Önleme ve Rate Limiting", description: "Platform bazlı işlem limitleri. Günlük/saatlik aksiyon limiti. Cooldown periyotları. Ban tespit ve otomatik durdurma. Hesap sağlık skoru.", status: "pending", priority: "normal", phase: "Faz 12: Güvenlik & Anti-Detection", category: "dev" },
  { taskCode: "ANL-1", title: "Engagement Analizi ve Raporlama", description: "Gönderi bazlı engagement rate hesaplama. En iyi performans gösteren içerik tipleri. Saat bazlı etkileşim analizi.", status: "pending", priority: "low", phase: "Faz 13: Gelişmiş Analitik", category: "dev", dependency: "Metrik verisi lazım" },
  { taskCode: "ANL-2", title: "Platform Metrik Çekme (Follower, Like, Comment)", description: "Her sosyal hesaptan follower sayısı, gönderi etkileşimi, erişim metrikleri çekme. Günlük otomatik senkronizasyon.", status: "pending", priority: "normal", phase: "Faz 13: Gelişmiş Analitik", category: "dev", dependency: "API bağlama gerekli" },
  { taskCode: "API-1", title: "Instagram Graph API (Meta Business) Entegrasyonu", description: "Meta Business API üzerinden Instagram içerik paylaşımı. Business/Creator hesap gereksinimi. Medya yükleme, caption, hashtag.", status: "pending", priority: "high", phase: "Faz 8: Sosyal Medya API", category: "dev" },

  // Beklemede
  { taskCode: "BEK-1", title: "Proxy/IP Yönetim Altyapısı", description: "5.11'de proxy alanları eklendi, kalan proxy havuzu SEC-1'de", status: "on_hold", priority: "low", phase: "Faz 7: Altyapı Genişletme", category: "dev" },
  { taskCode: "BEK-2", title: "CSV/JSON Import — Toplu Persona Yükleme", description: "Dosya yükleme ile toplu persona oluşturma. CSV ve JSON format desteği.", status: "on_hold", priority: "low", phase: "Faz 7: Altyapı Genişletme", category: "dev" },
  { taskCode: "BEK-3", title: "Twitter/X API OAuth 2.0", description: "OAuth 1.0a çalışıyor, 2.0 acil değil", status: "on_hold", priority: "low", phase: "Faz 8: Sosyal Medya API", category: "dev" },
  { taskCode: "BEK-4", title: "TikTok API Entegrasyonu", description: "API erişimi zor, öncelik düşük", status: "on_hold", priority: "low", phase: "Faz 8: Sosyal Medya API", category: "dev" },
  { taskCode: "BEK-5", title: "YouTube Data API Entegrasyonu", description: "Posting önceliği düşük", status: "on_hold", priority: "low", phase: "Faz 8: Sosyal Medya API", category: "dev" },
  { taskCode: "BEK-6", title: "İçerik Şablonları (Reusable Templates)", description: "Nice-to-have", status: "on_hold", priority: "low", phase: "Faz 9: Gelişmiş AI & İçerik", category: "dev" },
  { taskCode: "BEK-7", title: "İçerik Onay Akışı (Approval Workflow)", description: "2 kullanıcıda gereksiz", status: "on_hold", priority: "low", phase: "Faz 9: Gelişmiş AI & İçerik", category: "dev" },
  { taskCode: "BEK-8", title: "İçerik Takvimi Görünümü", description: "Görsel şeker, core değil", status: "on_hold", priority: "low", phase: "Faz 9: Gelişmiş AI & İçerik", category: "dev" },
  { taskCode: "BEK-9", title: "AI Model Seçim ve Karşılaştırma", description: "Gemini yeterli şu an", status: "on_hold", priority: "low", phase: "Faz 9: Gelişmiş AI & İçerik", category: "dev" },
  { taskCode: "BEK-10", title: "A/B Test Altyapısı", description: "Veri olmadan anlamsız", status: "on_hold", priority: "low", phase: "Faz 10: Otomasyon", category: "dev" },
  { taskCode: "BEK-11", title: "Trend Algılama ve Otomatik İçerik Önerisi", description: "Monitoring önce bitmeli", status: "on_hold", priority: "low", phase: "Faz 10: Otomasyon", category: "dev" },
  { taskCode: "BEK-12", title: "Otomatik Etkileşim Kuralları", description: "Riskli, ban nedeni olabilir", status: "on_hold", priority: "low", phase: "Faz 10: Otomasyon", category: "dev" },
  { taskCode: "BEK-13", title: "Trigger-Based Otomasyon Motoru", description: "Over-engineering riski", status: "on_hold", priority: "low", phase: "Faz 10: Otomasyon", category: "dev" },
];

export async function seedTasks() {
  console.log("Seeding tasks...");

  for (const task of TASKS) {
    await db.insert(teamTasks).values(task).onConflictDoNothing();
  }

  console.log(`Seeded ${TASKS.length} tasks.`);
}
