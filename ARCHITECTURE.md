# Persona — Mimari & Altyapı

> Sistem özellikleri, tech kararlar, API kontratları, deploy bilgileri.

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes + Auth.js v5 |
| Database | PostgreSQL 16 (Drizzle ORM) |
| Cache/Queue | Redis 7 + BullMQ |
| AI | Google Gemini API |
| Storage | Cloudflare R2 |
| Error Tracking | Sentry (@sentry/nextjs) |
| Deploy | Hetzner VPS + Docker Compose + Coolify |

## Altyapı

| Alan | Değer |
|---|---|
| Sunucu | 46.225.216.104 (Hetzner) |
| SSH | `ssh -i ~/.ssh/aicouncil root@46.225.216.104` |
| Container | `gs8cko4wg4k08s4wg4kkkko4-221527723936` |
| Port | 3333 → 3000 |
| Canlı URL | http://46.225.216.104:3333 |
| Compose path | `/data/coolify/applications/gs8cko4wg4k08s4wg4kkkko4/docker-compose.yaml` |
| Env path | `/data/coolify/applications/gs8cko4wg4k08s4wg4kkkko4/.env` |

### Manuel Deploy

```bash
ssh -i ~/.ssh/aicouncil root@46.225.216.104
cd /tmp && rm -rf Persona && git clone --depth 1 https://github.com/kadir-a11y/Persona.git
cd Persona && docker build --no-cache -t persona:latest .
cd /data/coolify/applications/gs8cko4wg4k08s4wg4kkkko4 && docker compose down && docker compose up -d
rm -rf /tmp/Persona
```

### Sunucu Port Haritası (46.225.216.104)

| Proje | Port |
|---|---|
| Persona | 3333 |
| Revora App | 3100 |
| AICouncil Frontend | 81 |
| AICouncil Backend | 8080 |
| ReTrade Web | 8100 |
| RangeBot | 8090 |
| Kadir PA | 8700 |
| Web Audit Dashboard | 3456 |
| Coolify Panel | 8000 |

## Mimari Kararlar

### Platform Adapter Pattern
Her sosyal medya platformu için ortak interface. Yeni platform eklemek = yeni adapter yazmak.
```
src/lib/platforms/
├── types.ts              ← PlatformAdapter interface
├── registry.ts           ← Adapter registry (Map-based)
├── adapters/
│   ├── twitter.ts        ← Gerçek Twitter API
│   ├── stub.ts           ← 8 platform için stub (instagram, facebook, vb.)
│   └── index.ts          ← Auto-register
└── twitter/              ← Twitter-specific modüller
    ├── auth.ts, client.ts, posting.ts, metrics.ts, validation.ts
```

### Monitoring Adapter Pattern
İçerik izleme kaynakları için pluggable adapter sistemi.
```
src/lib/monitoring/
├── types.ts              ← MonitoringAdapter interface
├── adapters/
│   ├── rss.ts, twitter.ts, reddit.ts, youtube.ts
│   ├── google-news.ts, tiktok.ts, instagram.ts
│   └── index.ts          ← Registry
```

### Worker Sistemi (BullMQ)

| Worker | Concurrency | Cron |
|---|---|---|
| content-delivery | 5 | — |
| ai-generation | 3 | — |
| campaign-execution | 2 | — |
| monitoring | 3 | 15 dk |
| relevance-scoring | 5 | — |
| workspace-publishing | 3 | — |
| organic-activity | 2 | 30 dk |
| metrics-collector | 1 | 6 saat |

### Güvenlik

- Token şifreleme: AES-256-GCM (`src/lib/services/token-service.ts`)
- Rate limiting: In-memory (auth 10/15dk, AI 20/dk, upload 30/dk)
- Prompt injection koruması: XML delimiter wrapping
- RBAC: `system_roles` + `user_system_roles` + `requirePermission()` guard
- SVG upload engeli, FK indexler, parametrik SQL

### Env Değişkenleri (Gerekli)

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://46.225.216.104:3333
GEMINI_API_KEY=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=...
R2_PUBLIC_URL=...
TOKEN_ENCRYPTION_KEY=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
RAPIDAPI_KEY=...
NEXT_PUBLIC_SENTRY_DSN=...  (henüz ayarlanmadı)
SENTRY_ORG=...              (henüz ayarlanmadı)
SENTRY_PROJECT=...          (henüz ayarlanmadı)
```
