export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { dateOfBirth, gender, avatarEmoji } = body;

    const user = await prisma.user.upsert({
      where: { auth0Id: session.user.sub },
      update: {
        email: session.user.email,
        displayName: session.user.name || session.user.email,
        avatarUrl: session.user.picture || undefined,
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(avatarEmoji && { avatarEmoji }),
      },
      create: {
        auth0Id: session.user.sub,
        email: session.user.email,
        displayName: session.user.name || session.user.email,
        avatarUrl: session.user.picture || null,
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(avatarEmoji && { avatarEmoji }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
