import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validators";

function computeAge(dateOfBirth: Date): { years: number; months: number } {
  const now = new Date();
  let years = now.getFullYear() - dateOfBirth.getFullYear();
  let months = now.getMonth() - dateOfBirth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  // Adjust if day hasn't passed yet this month
  if (now.getDate() < dateOfBirth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  return { years, months };
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        _count: {
          select: {
            measurements: true,
            achievements: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get latest measurement (ordered by date DESC, not createdAt)
    const latestMeasurement = await prisma.measurement.findFirst({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        height: true,
        weight: true,
        bmi: true,
        date: true,
      },
    });

    // Compute age from dateOfBirth
    const age = user.dateOfBirth ? computeAge(user.dateOfBirth) : null;

    return NextResponse.json({
      ...user,
      age,
      latestMeasurement,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { displayName, dateOfBirth, gender, avatarEmoji } = parsed.data;

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender !== undefined && { gender }),
        ...(avatarEmoji !== undefined && { avatarEmoji }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
