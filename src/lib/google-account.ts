import { prisma } from "@/lib/prisma";

/**
 * Google連携（Calendar API呼び出し）用の有効なアクセストークンを返す。
 *
 * DBセッション化（PrismaAdapter）に伴い、Googleのaccess_token/refresh_tokenは
 * next-authのSessionではなくAccountテーブルに保存されている。期限切れなら
 * リフレッシュトークンで更新し、Accountテーブルにも書き戻す。
 */
export async function getValidGoogleAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.access_token) {
    return null;
  }

  const isExpired =
    !account.expires_at || Date.now() >= account.expires_at * 1000 - 60_000;
  if (!isExpired) {
    return account.access_token;
  }

  if (!account.refresh_token) {
    return null;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
      }),
    });

    const refreshed = await response.json();
    if (!response.ok) {
      throw refreshed;
    }

    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: refreshed.access_token,
        expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
        refresh_token: refreshed.refresh_token ?? account.refresh_token,
      },
    });

    return refreshed.access_token as string;
  } catch (error) {
    console.error("Google access token refresh failed", error);
    return null;
  }
}
