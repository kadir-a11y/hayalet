# hayalet — Claude Code Talimatları

> Genel kurallar `D:\GitHub\CLAUDE.md` dosyasındadır (otomatik okunur).

---

## Proje Tanımı
Hayalet projesi. Next.js tabanlı web uygulaması. Cloudflare R2 medya depolama, Gemini AI entegrasyonu.

## Tech Stack
- **Framework:** Next.js — Port: 3333
- **DB:** PostgreSQL (harici sunucu: 46.225.216.104:5436)
- **Cache:** Redis (harici sunucu: 46.225.216.104:6381)
- **Auth:** Auth.js (AUTH_SECRET)
- **AI:** Google Gemini
- **Storage:** Cloudflare R2

## Credentials & Ortam
`.env` dosyasını doğrudan oku:
- `DATABASE_URL` — PostgreSQL bağlantısı
- `REDIS_URL` — Redis cache
- `AUTH_SECRET` / `AUTH_URL` — Auth yapılandırması
- `GEMINI_API_KEY` — Google Gemini AI
- `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` — Cloudflare R2

## Notion Referansları
- Notion kartı yok (henüz)

## Ortak Çalışma
- Başka geliştirici: Hayır
- CLAUDE.md git'e dahil: Evet

---

## Session Handoff Protocol

> **Kural:** Her session başında oku, her session sonunda yaz.
> **Amaç:** Context kaybını sıfıra indirmek.

### Notion Proje Sayfası
- Proje sayfası: `https://www.notion.so/322dccfc21ee819187e4d55deee1ea80`
- Handoff Log: `https://www.notion.so/322dccfc21ee8103b2cbf5d2cbf32f7e`

### 1. Session Başlangıç Protokolü

Her yeni session'da ÖNCE şunu yap:

1. Bu CLAUDE.md dosyasını oku (projeyi tanı)
2. Projenin Notion Handoff Log sayfasını kontrol et
3. Son handoff kaydını oku → nerede kalındığını öğren
4. Kullanıcıya kısa özet ver: "Son session'da X yapılmış, Y'de kalınmış. Devam edeyim mi?"
5. Onay al, sonra çalışmaya başla

**Handoff Log boşsa veya erişilemiyorsa:** Kullanıcıya sor, varsayma.

### 2. Session Bitiş / Tıkanma Protokolü

Aşağıdaki durumlardan BİRİ gerçekleştiğinde Handoff Log'a yaz:

- Görev tamamlandı
- Context limiti yaklaşıyor
- Blocker var
- Kullanıcı "burada bırakalım" dedi
- Beklenmedik hata / donma riski

**Handoff kaydı formatı:**

```
### [TARİH] — Session Handoff

**Durum:** Tamamlandı | Devam edecek | Bloke

**Ne yapıldı:**
- [Kısa madde 1]
- [Kısa madde 2]

**Nerede kalındı:**
[Tam olarak hangi dosya, hangi fonksiyon, hangi adımda bırakıldı]

**Blocker (varsa):**
[Ne engelledi, ne bekleniyor]

**Önerilen sonraki adım:**
[Yeni session'ın ilk yapması gereken şey]

**Değişen dosyalar:**
- [dosya1 — ne değişti]
```

### 3. Görev Tamamlama Protokolü

1. Handoff Log'a "Tamamlandı" kaydı yaz
2. İlgili Notion görev kartını güncelle
3. Yan etkiler varsa belirt

### 4. Acil Handoff

Context limitine yaklaşıyorsan → HEMEN handoff yaz (kısa da olsa).
Notion erişimi yoksa → handoff'u kullanıcıya metin olarak ver.

> Handoff yazmadan session'ı BİTİRME.
> Handoff'u TÜRKÇE yaz.
> Sadece EKLE, eski kayıtları SİLME.
