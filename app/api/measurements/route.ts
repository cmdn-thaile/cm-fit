export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { createMeasurementSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const measurements = await prisma.measurement.findMany({
      where: { userId: currentUser.id },
      orderBy: { date: "desc" },
      ...(limit && { take: parseInt(limit, 10) }),
    });

    return NextResponse.json(measurements);
  } catch (error) {
    console.error("Error fetching measurements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createMeasurementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { weight, height, note, date } = parsed.data;
    const bmi = weight / Math.pow(height / 100, 2);

    const measurement = await prisma.measurement.create({
      data: {
        weight,
        height,
        bmi: Math.round(bmi * 100) / 100,
        note,
        date: new Date(date),
        userId: currentUser.id,
      },
    });

    // Check achievements
    const newAchievements: Array<{ type: string; title: string; emoji: string }> = [];

    // Check "first_measurement"
    const existingFirst = await prisma.achievement.findFirst({
      where: { userId: currentUser.id, type: "first_measurement" },
    });
    if (!existingFirst) {
      newAchievements.push({
        type: "first_measurement",
        title: "Phép đo đầu tiên",
        emoji: "🌟",
      });
    }

    // Check "streak_7" — 7+ measurements in last 30 days
    const existingStreak = await prisma.achievement.findFirst({
      where: { userId: currentUser.id, type: "streak_7" },
    });
    if (!existingStreak) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCount = await prisma.measurement.count({
        where: {
          userId: currentUser.id,
          date: { gte: thirtyDaysAgo },
        },
      });
      if (recentCount >= 7) {
        newAchievements.push({
          type: "streak_7",
          title: "Streak 7 ngày",
          emoji: "🔥",
        });
      }
    }

    // Check "growth_spurt" — height increased 2+ cm from previous measurement
    const existingGrowth = await prisma.achievement.findFirst({
      where: { userId: currentUser.id, type: "growth_spurt" },
    });
    if (!existingGrowth) {
      const previousMeasurement = await prisma.measurement.findFirst({
        where: {
          userId: currentUser.id,
          id: { not: measurement.id },
        },
        orderBy: { date: "desc" },
      });
      if (previousMeasurement && height - previousMeasurement.height >= 2) {
        newAchievements.push({
          type: "growth_spurt",
          title: "Lớn nhanh",
          emoji: "🌱",
        });
      }
    }

    // Create new achievements
    if (newAchievements.length > 0) {
      await prisma.achievement.createMany({
        data: newAchievements.map((a) => ({
          ...a,
          userId: currentUser.id,
        })),
      });
    }

    return NextResponse.json(
      { measurement, achievements: newAchievements },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating measurement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
