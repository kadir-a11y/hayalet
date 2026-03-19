# Persona — Sosyal Medya Management Platformu

Sosyal medya hesaplarını tek panelden yöneten, AI destekli içerik üreten, zamanlama ve kuyruk sistemiyle çoklu hesap operasyonu sağlayan bir sosyal medya management platformu. Hootsuite benzeri — kullanıcılar kendi hesaplarını ekler, platform içerik üretimi, zamanlama ve yayınlamayı yönetir.

Tech: Next.js 15 (App Router) + TypeScript + PostgreSQL 16 (Drizzle ORM) + Redis 7 + BullMQ + Google Gemini API + Tailwind/shadcn + Auth.js v5 + Cloudflare R2 + Coolify VPS
Repo: github.com/kadir-a11y/persona (private)

---

## Session Başlangıç — BUNU ATLA DEMEDİKÇE SIRASI İLE YAP

1. Bu dosyayı oku (zaten okudun)
2. `.env` dosyası var mı kontrol et. YOKSA → aşağıdaki "İlk Kurulum" bölümüne git
3. `git log --oneline -20` çalıştır → ne yapılmış gör
4. **`HANDOFF.md` oku** → en üstteki kaydı oku, son durumu anla
5. **`GET /api/team-tasks` çağır veya `/tasks` sayfasını kontrol et** → aktif görevleri gör
6. Kullanıcıya şu formatla başla:
   ```
   Son session: [tarih — başlık — kim]
   Kalan görevler: [DB'den aktif görevleri listele]
   Önerilen adım: [en yüksek öncelikli görev]

   Bununla devam edelim mi, yoksa farklı bir şey mi yapalım?
   ```
7. Kullanıcı onay verene kadar kod yazma.

---

## İlk Kurulum (sadece yeni bilgisayar veya .env yoksa)

`.env` dosyası git'e dahil değildir. Yeni bir ortamda çalışırken:

1. `ARCHITECTURE.md`'deki Env Değişkenleri bölümünü oku
2. Oradaki değişkenleri kullanarak proje kök dizininde `.env` dosyası oluştur
3. Docker servislerini başlat: `docker compose up -d`
4. Uygulamayı test et: `pnpm dev`

SSH bağlantısı gerekiyorsa → `ARCHITECTURE.md`'deki Altyapı bölümüne bak.

Bu adımlar sadece 1 kere yapılır. `.env` oluşturulduktan sonra bu bölüm atlanır.

---

## ZORUNLU: Görev Takibi

**Tüm görev takibi repo içinde yapılır. Notion KULLANILMAZ.**

### Dosyalar:
| Dosya | İçerik | Boyut Kontrolü |
|---|---|---|
| `/tasks` sayfası (DB) | Tüm görevler — yapılacak, devam eden, beklemede, tamamlanan | Veritabanında |
| `HANDOFF.md` | Son 5 session kaydı | Eskileri `docs/handoff-archive.md`'ye taşı |
| `ARCHITECTURE.md` | Sistem bilgisi, deploy, env, mimari kararlar | Nadiren değişir |
| `docs/tasks-completed.md` | Tamamlanan görevlerin geçmiş arşivi | Sadece referans |
| `docs/handoff-archive.md` | Eski handoff kayıtları | Sadece arşiv |

### Görev Güncelleme Kuralları:
- Görevler **veritabanında** tutulur — `/tasks` sayfası veya `GET /api/team-tasks` API ile erişilir
- Göreve başladığında → API ile durumu `in_progress` yap
- Görev bitince → API ile durumu `completed` yap, `solution` alanına ne yapıldığını yaz
- Yeni görev eklerken → `POST /api/team-tasks` ile ekle, `taskCode` formatı: MON-X, AI-X, OTO-X, SEC-X, ANL-X, API-X
- ASLA "toplu güncelleme yaparım" deme — HER GÖREVİ TEK TEK güncelle
- Çelişki varsa: `git log` > DB (API) > `HANDOFF.md`

---

## ZORUNLU: Session İçi Akış

- Görev bitti → commit et → TASKS.md güncelle → sıradaki göreve GEÇ. Soru sorma, liste sunma.
- Sadece BLOCKER varsa veya KARAR GEREKİYORSA dur ve sor.
- "Başlayayım mı?" diye sorma — başla.
- Her 3 commit sonrası → HANDOFF.md güncelle (kısa da olsa).
- Commit sonrası otomatik push et.

---

## ZORUNLU: Session Bitiş — BUNLARI YAPMADAN SESSION BİTMEZ

Kullanıcı "bitti", "tamam", "kapat", "son", "bitir" derse:

### Adım 1: HANDOFF.md'ye kayıt yaz (en üste)
```
### [TARİH] — [Kim] — [Başlık]
**Durum:** Tamamlandı / Kodlandı (deploy bekliyor) / Devam edecek
**PC:** Ev / Ofis
**Ne yapıldı:** [bullet list]
**Nerede kalındı:** [net açıklama]
**Blocker:** [varsa / Yok]
**Önerilen sonraki adım:** [somut, spesifik]
**Son commit:** [hash]
**Deploy:** [Evet / Hayır — neden]
```

"Son durum" tablosunu güncelle (branch, commit, deploy, PC).

### Adım 2: Görevleri güncelle
- Tamamlanan görevleri API ile `completed` yap, `solution` alanına commit hash ve açıklama yaz
- Yeni çıkan görevleri API ile ekle
- Durum değişikliklerini işle

### Adım 3: Commit et
```bash
git add HANDOFF.md docs/
git commit -m "docs: update handoff"
git push
```

### Adım 4: Kullanıcıya onayla
"Handoff yazıldı, görevler güncellendi. Başka bir şey var mı?"

**Session'ı bitirmek isteyip handoff'u reddederse bile en az 2 cümlelik kısa handoff yaz.**

---

## ZORUNLU: Uzun Session Kuralı

Her 30 dakikada bir VEYA büyük bir görev tamamlandığında:
→ "Handoff güncellemeli miyim?" diye sor.
Kullanıcı hayır derse devam et ama session sonunda mutlaka yaz.

---

## Global Kurallar

### Temel İlkeler
- **Önce oku, sonra yap.** Dosyayı düzenlemeden önce tamamını oku.
- **Önce planla, sonra kodla.** Karmaşık işlemlerde adımları yaz, onay al.
- **Tek kaynak, tek dosya.** Mevcut dosyayı güncelle, aynı isimde yeni oluşturma.
- **Emin değilsen varsayma, sor.**

### Yapma
- Dosyayı kısmen okuyup işlem yapma
- Onay almadan büyük değişiklik yapma
- Hata alınca aynı yöntemi tekrar deneme — farklı yaklaşım öner
- Commented-out kod bırakma
- Console.log production'da bırakma
- Empty catch block ile error yutma

### Yap
- Dosya işlemlerinde tam yol kullan
- Karmaşık işleri adımlara böl
- Input validation, XSS prevention, SQL injection prevention
- Type safety ve error handling zorunlu
- DRY prensibi
- Türkçe string'lerde doğru Türkçe karakter kullan (ş, ğ, ü, ö, ç, ı, İ, Ş, Ğ, Ü, Ö, Ç)

### Commit
- Format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- İngilizce, tek mantıksal değişiklik per commit
- Branch: `main` (production), `feat/[isim]`, `fix/[isim]`
- Commit sonrası otomatik push

### 4 Aşamalı Workflow
1. **Analiz** — Görevi anla, mevcut kodu incele
2. **Planlama** — Adım adım plan, onay al
3. **Uygulama** — Plana göre kod yaz, incremental
4. **Review** — Değişiklikleri özetle, dökümante et
