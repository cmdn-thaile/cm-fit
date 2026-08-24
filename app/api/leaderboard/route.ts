export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leaderboard?period=weekly|monthly
 * Ranks users by most weight LOST (negative change = better rank).
 * Losing weight = green (good), gaining weight = red (bad).
 */
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "weekly";

    const now = new Date();
    let startDate: Date;

    if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // Weekly: start from Monday of current week
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - mondayOffset);
      startDate.setHours(0, 0, 0, 0);
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        avatarEmoji: true,
        avatarUrl: true,
        measurements: {
          where: {
            date: { gte: startDate },
          },
          orderBy: { date: "asc" },
          select: {
            weight: true,
            date: true,
          },
        },
      },
    });

    const leaderboard = users
      .map((user) => {
        const measurementCount = user.measurements.length;
        let weightChange = 0;

        if (user.measurements.length >= 2) {
          const firstWeight = user.measurements[0].weight;
          const lastWeight = user.measurements[user.measurements.length - 1].weight;
          weightChange = Math.round((lastWeight - firstWeight) * 100) / 100;
        }

        return {
          userId: user.id,
          displayName: user.displayName,
          avatarEmoji: user.avatarEmoji,
          avatarUrl: user.avatarUrl,
          measurementCount,
          weightChange, // negative = lost weight (good), positive = gained (bad)
        };
      })
      .filter((entry) => entry.measurementCount >= 2) // need at least 2 to compare
      .sort((a, b) => a.weightChange - b.weightChange); // most negative first = top

    return NextResponse.json({ leaderboard, period });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
