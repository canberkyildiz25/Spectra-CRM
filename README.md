# Spectra CRM

Modern, hızlı ve kullanımı kolay bir müşteri ilişkileri yönetim sistemi. Next.js 14, Node.js/Express ve MongoDB Atlas ile geliştirilmiştir.

---

## Özellikler

- **Müşteri Yönetimi** — Müşteri profilleri, iletişim bilgileri ve geçmiş kayıtlar
- **Satış Pipeline** — Kanban tabanlı fırsat takibi ve satış hunisi yönetimi
- **Teklif Oluşturma** — Profesyonel teklif hazırlama ve PDF çıktısı
- **Görev Takibi** — Ekip içi görev atama ve ilerleme takibi
- **Dashboard** — Gerçek zamanlı satış ve performans istatistikleri
- **Kimlik Doğrulama** — JWT tabanlı güvenli giriş sistemi

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Veritabanı | MongoDB Atlas |
| Auth | JWT (JSON Web Token) |
| State | Zustand |
| Deploy | Vercel (frontend) · Railway (backend) |

---

## Proje Yapısı

```
Spectra CRM/
├── client/          # Next.js frontend uygulaması
│   ├── app/         # Sayfalar (App Router)
│   ├── components/  # Yeniden kullanılabilir bileşenler
│   ├── lib/         # API istemcisi, store, yardımcılar
│   └── public/      # Statik dosyalar
├── server/          # Express REST API
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── middleware/
├── shared/          # Ortak TypeScript tipleri
└── docs/            # Teknik dokümantasyon
```

---

## Kurulum ve Çalıştırma

### Gereksinimler

- Node.js 18+
- MongoDB Atlas hesabı (veya yerel MongoDB)

### 1. Repoyu klonla

```bash
git clone https://github.com/canberkyildiz25/Spectra-CRM.git
cd Spectra-CRM
```

### 2. Bağımlılıkları kur

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Ortam değişkenlerini ayarla

`server/.env` dosyası oluştur:

```env
MONGODB_URI=mongodb+srv://<kullanici>:<sifre>@cluster0.xxxx.mongodb.net/spectra-crm
JWT_SECRET=guclu_bir_secret_key
JWT_EXPIRE=7d
SERVER_PORT=5000
NODE_ENV=development
```

`client/.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Geliştirme sunucularını başlat

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd client && npm run dev
```

---

## Deployment

- **Backend** → [Railway](https://railway.app) üzerinde çalışır
- **Frontend** → [Vercel](https://vercel.com) üzerinde çalışır
- **Veritabanı** → MongoDB Atlas (M0 ücretsiz tier)

---

## Lisans

© 2026 Spectra CRM — Tüm hakları saklıdır.
