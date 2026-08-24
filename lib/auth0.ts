import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client();

/**
 * Get current user from DB. If user is logged in via Auth0 but
 * doesn't have a DB record yet, auto-creates one.
 */
export async function getCurrentUser() {
  const { prisma } = await import("./prisma");
  const session = await auth0.getSession();
  if (!session?.user?.sub) return null;

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
  });

  // Auto-create if first time
  if (!user) {
    user = await prisma.user.create({
      data: {
        auth0Id: session.user.sub,
        email: session.user.email || `${session.user.sub}@unknown.com`,
        displayName: session.user.name || session.user.nickname || "Kid",
        avatarUrl: session.user.picture || null,
      },
    });
  }

  return user;
}
