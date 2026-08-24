/**
 * Seeder script — creates a test user with 1 week of measurement data.
 *
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 *   or:  npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding KiddyFit database...\n");

  // Create or find the test user
  const user = await prisma.user.upsert({
    where: { email: "kid@kiddyfit.dev" },
    update: {},
    create: {
      auth0Id: "auth0|seed_user_001",
      email: "kid@kiddyfit.dev",
      displayName: "Bé Minh",
      dateOfBirth: new Date("2016-03-15"),
      gender: "male",
      avatarEmoji: "🐻",
    },
  });

  console.log(`✅ User created: ${user.displayName} (${user.email})`);

  // Delete existing measurements for clean seed
  await prisma.measurement.deleteMany({ where: { userId: user.id } });
  await prisma.achievement.deleteMany({ where: { userId: user.id } });

  // Generate 1 week of measurements (7 days back from now)
  const now = new Date();
  const measurements = [];

  // Base stats for a ~8 year old boy
  let weight = 25.2; // kg
  let height = 128.5; // cm

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(8, 0, 0, 0); // morning measurement

    // Small daily variations
    weight += (Math.random() - 0.4) * 0.15; // slight upward trend
    height += Math.random() * 0.05; // very slow growth

    weight = Math.round(weight * 10) / 10;
    height = Math.round(height * 10) / 10;

    const bmi = Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10;

    measurements.push({
      userId: user.id,
      weight,
      height,
      bmi,
      date,
      note: i === 6 ? "Bắt đầu theo dõi!" : i === 0 ? "Hôm nay 💪" : undefined,
    });
  }

  const created = await prisma.measurement.createMany({
    data: measurements,
  });

  console.log(`✅ Created ${created.count} measurements (last 7 days)`);
  console.log(`   Weight range: ${measurements[0].weight}kg → ${measurements[6].weight}kg`);
  console.log(`   Height range: ${measurements[0].height}cm → ${measurements[6].height}cm`);

  // Award achievements
  const achievements = await prisma.achievement.createMany({
    data: [
      {
        userId: user.id,
        type: "first_measurement",
        title: "Phép đo đầu tiên",
        emoji: "🌟",
        earnedAt: measurements[0].date,
      },
      {
        userId: user.id,
        type: "streak_7",
        title: "Streak 7 ngày",
        emoji: "🔥",
        earnedAt: measurements[6].date,
      },
    ],
  });

  console.log(`✅ Created ${achievements.count} achievements`);

  // Create a second user for leaderboard
  const user2 = await prisma.user.upsert({
    where: { email: "kid2@kiddyfit.dev" },
    update: {},
    create: {
      auth0Id: "auth0|seed_user_002",
      email: "kid2@kiddyfit.dev",
      displayName: "Bé Lan",
      dateOfBirth: new Date("2017-07-22"),
      gender: "female",
      avatarEmoji: "🐱",
    },
  });

  await prisma.measurement.deleteMany({ where: { userId: user2.id } });

  // Bé Lan has 4 measurements this week
  let w2 = 21.8;
  let h2 = 118.2;
  const m2 = [];

  for (let i = 3; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 2); // every other day
    date.setHours(9, 0, 0, 0);

    w2 += (Math.random() - 0.3) * 0.1;
    h2 += Math.random() * 0.03;
    w2 = Math.round(w2 * 10) / 10;
    h2 = Math.round(h2 * 10) / 10;

    m2.push({
      userId: user2.id,
      weight: w2,
      height: h2,
      bmi: Math.round((w2 / Math.pow(h2 / 100, 2)) * 10) / 10,
      date,
    });
  }

  const created2 = await prisma.measurement.createMany({ data: m2 });
  console.log(`\n✅ User 2: ${user2.displayName} — ${created2.count} measurements`);

  // Third user for leaderboard
  const user3 = await prisma.user.upsert({
    where: { email: "kid3@kiddyfit.dev" },
    update: {},
    create: {
      auth0Id: "auth0|seed_user_003",
      email: "kid3@kiddyfit.dev",
      displayName: "Bé Hùng",
      dateOfBirth: new Date("2015-11-08"),
      gender: "male",
      avatarEmoji: "🦁",
    },
  });

  await prisma.measurement.deleteMany({ where: { userId: user3.id } });

  let w3 = 30.5;
  let h3 = 135.0;
  const m3 = [];

  for (let i = 4; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(7, 30, 0, 0);

    w3 += (Math.random() - 0.35) * 0.2;
    h3 += Math.random() * 0.04;
    w3 = Math.round(w3 * 10) / 10;
    h3 = Math.round(h3 * 10) / 10;

    m3.push({
      userId: user3.id,
      weight: w3,
      height: h3,
      bmi: Math.round((w3 / Math.pow(h3 / 100, 2)) * 10) / 10,
      date,
    });
  }

  const created3 = await prisma.measurement.createMany({ data: m3 });
  console.log(`✅ User 3: ${user3.displayName} — ${created3.count} measurements`);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Summary:");
  console.log("   • 3 users (Bé Minh, Bé Lan, Bé Hùng)");
  console.log("   • 7 + 4 + 5 = 16 measurements (last 7 days)");
  console.log("   • 2 achievements (Bé Minh)");
  console.log("\n💡 Login as kid@kiddyfit.dev to see the dashboard with data.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
