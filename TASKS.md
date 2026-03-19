# Persona — Görev Takibi

> Sadece aktif görevler burada. Tamamlananlar → `docs/tasks-completed.md`
> Son güncelleme: 2026-03-19

## Son Durum

| Metrik | Değer |
|---|---|
| Aktif (Yapılacak) | 12 |
| Beklemede | 24 |
| Tamamlanan (toplam) | 40+ |

---

## Yapılacak

| ID | Görev | Faz | Atanan | Öncelik | Bağımlılık |
|---|---|---|---|---|---|
| MON-2 | Monitoring Worker Altyapısı — BullMQ worker'lar (twitter-scan, monitoring, relevance-scoring queue'larını consume edecek) | Faz 7 | — | Yüksek | — |
| MON-3 | Monitoring API Endpoints — Topic CRUD, source yönetimi, discovered items, auto-post rules API'ları | Faz 7 | — | Yüksek | API bağlama gerekli |
| AI-1 | Persona-Aware Prompt Mühendisliği — Tüm persona bilgilerini (traits, interests, tone, emoji, konum, dil) otomatik AI prompt'una yedir | Faz 9 | — | Yüksek | — |
| AI-2 | Platform-Spesifik İçerik Formatlama — Twitter 280 char, Instagram hashtag, LinkedIn profesyonel ton. Platform bazlı otomatik uyarlama | Faz 9 | — | Orta | — |
| AI-3 | Few-Shot Learning — Personanın önceki gönderilerini prompt'a örnek ekle. 3-5 örnek ile stil tutarlılığı | Faz 9 | — | Orta | — |
| OTO-1 | Zamanlanmış Kampanya Tetikleme — Cron-based kampanya zamanlama, tekrarlayan kampanyalar, BullMQ Job Scheduler | Faz 10 | — | Orta | — |
| OTO-2 | Hesap Durumu Otomatik Kontrol Cron'u — Günlük cron ile sosyal hesapların açık/kapalı/askıda durumunu kontrol | Faz 10 | — | Orta | API bağlama gerekli |
| SEC-1 | Proxy Rotasyonu ve IP Havuzu Yönetimi — Otomatik proxy rotasyonu, BrightData/Oxylabs entegrasyonu | Faz 12 | @murat | Orta | — |
| SEC-2 | Platform Ban Önleme ve Rate Limiting — Platform bazlı işlem limitleri, cooldown, ban tespit, hesap sağlık skoru | Faz 12 | — | Orta | — |
| ANL-1 | Engagement Analizi ve Raporlama — Gönderi bazlı engagement rate, en iyi içerik tipleri, saat bazlı analiz | Faz 13 | — | Düşük | Metrik verisi lazım |
| ANL-2 | Platform Metrik Çekme (Follower, Like, Comment) — Günlük otomatik senkronizasyon, metrik geçmişi | Faz 13 | @murat | Orta | API bağlama gerekli |
| API-1 | Instagram Graph API (Meta Business) Entegrasyonu — İçerik paylaşımı, medya yükleme, caption, hashtag | Faz 8 | @murat | Yüksek | — |

---

## Beklemede

> Bu görevler şu an aktif değil. Koşullar oluşunca "Yapılacak"a taşınır.

| ID | Görev | Faz | Neden Beklemede |
|---|---|---|---|
| BEK-1 | Proxy/IP Yönetim Altyapısı | Faz 7 | 5.11'de proxy alanları eklendi, kalan proxy havuzu SEC-1'de |
| BEK-2 | CSV/JSON Import — Toplu Persona Yükleme | Faz 7 | Öncelik düşük |
| BEK-3 | Twitter/X API OAuth 2.0 | Faz 8 | OAuth 1.0a çalışıyor |
| BEK-4 | TikTok API Entegrasyonu | Faz 8 | API erişimi zor |
| BEK-5 | YouTube Data API Entegrasyonu | Faz 8 | Posting önceliği düşük |
| BEK-6 | İçerik Şablonları (Reusable Templates) | Faz 9 | Nice-to-have |
| BEK-7 | İçerik Onay Akışı (Approval Workflow) | Faz 9 | 2 kullanıcıda gereksiz |
| BEK-8 | İçerik Takvimi Görünümü | Faz 9 | Görsel şeker |
| BEK-9 | AI Model Seçim ve Karşılaştırma | Faz 9 | Gemini yeterli |
| BEK-10 | A/B Test Altyapısı | Faz 10 | Veri olmadan anlamsız |
| BEK-11 | Trend Algılama ve Otomatik İçerik Önerisi | Faz 10 | Monitoring önce bitmeli |
| BEK-12 | Otomatik Etkileşim Kuralları | Faz 10 | Riskli, ban nedeni |
| BEK-13 | Trigger-Based Otomasyon Kuralları Motoru | Faz 10 | Over-engineering |
| BEK-14 | Takım Daveti ve Üye Yönetimi | Faz 11 | 2 kullanıcıda gereksiz |
| BEK-15 | Çoklu Oturum ve SSO Desteği | Faz 11 | Enterprise özellik |
| BEK-16 | Aktivite Akışı (Takım Activity Feed) | Faz 11 | Activity log zaten var |
| BEK-17 | Browser Fingerprint Yönetimi | Faz 12 | Karmaşık, öncelik düşük |
| BEK-18 | 2FA Desteği (TOTP/SMS Kodları) | Faz 12 | Niş ihtiyaç |
| BEK-19 | Hesap Aktivite Simülasyonu | Faz 12 | Riskli |
| BEK-20 | Gelişmiş Grafikler ve Heatmap | Faz 13 | Veri birikince |
| BEK-21 | Persona Performans Karşılaştırması | Faz 13 | Veri birikince |
| BEK-22 | CSV/PDF Export ve Otomatik Raporlama | Faz 13 | Nice-to-have |
| BEK-23 | Kampanya ROI Takibi | Faz 13 | Veri birikince |
| BEK-24 | Faz 14 — SaaS & Ödeme (7 görev: Stripe, Billing, Landing, Plan, Usage, White-Label, Public API) | Faz 14 | Ürün olgunlaşınca |

---

## Ekip

| Kişi | Uzmanlık | Odak Alanı |
|---|---|---|
| @kadir | Full-stack, AI, mimari | Genel geliştirme, prompt engineering, altyapı |
| @murat | API entegrasyon, monitoring, proxy | Dış veri çekme, platform API, proxy yönetimi |
| @ogulcan | — | Atanacak |

---

## Kurallar

- Göreve başlarken: Bu dosyada durumu "Devam Ediyor" olarak güncelle
- Görev bitince: `docs/tasks-completed.md`'ye taşı (tarih + commit hash ile)
- Yeni görev eklerken: Uygun ID ver (MON-X, AI-X, OTO-X, SEC-X, ANL-X, API-X, BEK-X)
- Çelişki varsa: `git log` > `TASKS.md` > `HANDOFF.md`
