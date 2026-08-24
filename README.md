# 🐻 KiddyFit

Ứng dụng theo dõi cân nặng và chiều cao cho trẻ em — giao diện dễ thương, pastel, đầy animal mascot.

## ✨ Tính năng

- 📊 Dashboard trực quan với chart (cân nặng, chiều cao, BMI theo thời gian)
- 👶 Quản lý nhiều trẻ cùng lúc
- 📝 Ghi nhận measurement nhanh chóng
- 🏆 Leaderboard hàng tháng
- 🎖️ Achievement / Gamification (streak, growth spurt, ...)
- 🔐 Đăng nhập qua Auth0
- 📱 Responsive, mobile-first

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | Auth0 (@auth0/nextjs-auth0) |
| ORM | Prisma 5 |
| Database | MongoDB |
| UI | Tailwind CSS + custom pastel theme |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Icons | Lucide React |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (MongoDB Atlas recommended)
- Auth0 account

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in your MongoDB URL, Auth0 credentials

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database
npx prisma db push

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
kiddyfit/
├── app/
│   ├── page.tsx                  → Dashboard (charts, stats)
│   ├── children/
│   │   ├── page.tsx              → Children list
│   │   ├── new/page.tsx          → Add child form
│   │   └── [id]/
│   │       ├── page.tsx          → Child detail + measurements
│   │       └── measure/page.tsx  → Add measurement form
│   ├── achievements/page.tsx     → Gamification badges
│   ├── leaderboard/page.tsx      → Monthly leaderboard
│   ├── profile/page.tsx          → User profile
│   └── api/
│       ├── users/sync/           → Auth0 user sync
│       ├── children/             → CRUD
│       ├── children/[id]/measurements/ → Measurements + BMI
│       ├── children/[id]/achievements/ → Badges
│       └── leaderboard/          → Monthly ranking
├── components/
│   ├── nav/                      → BottomNav, TopBar
│   └── ui/                       → MascotCard
├── lib/
│   ├── prisma.ts                 → DB singleton
│   ├── auth0.ts                  → Auth helpers
│   ├── validators.ts             → Zod schemas
│   └── utils.ts                  → cn() helper
└── prisma/
    └── schema.prisma             → Data models
```

## 🎨 Design

- Pastel palette: pink, lavender, mint, cream
- Animal mascot emojis: 🐻🐶🐱🐰🦁🦊🐼🐨🦉🐸
- Rounded cards with soft shadows
- Mobile-first bottom navigation
- Framer Motion page transitions

## 📝 Notes on BMI

> BMI của trẻ nên được đánh giá theo tuổi + giới tính + BMI-for-age percentile, không nên dùng ngưỡng BMI người lớn để kết luận thừa/thiếu cân.

Ứng dụng tính BMI đơn giản (weight / height²) để theo dõi xu hướng. Kết quả nên được thảo luận với bác sĩ.

## License

MIT
