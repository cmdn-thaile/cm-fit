export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/measurements/latest
 * Returns the most recent measurement for the current user.
 * Sorted by date DESC (not createdAt) — source of truth for "latest".
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latest = await prisma.measurement.findFirst({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    if (!latest) {
      return NextResponse.json({ measurement: null });
    }

    return NextResponse.json({
      measurement: {
        id: latest.id,
        height: latest.height,
        weight: latest.weight,
        bmi: latest.bmi,
        date: latest.date,
      },
    });
  } catch (error) {
    console.error("Error fetching latest measurement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
