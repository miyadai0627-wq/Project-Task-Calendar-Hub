import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

const CALENDAR_SCOPE =
  "openid email profile https://www.googleapis.com/auth/calendar.events";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: CALENDAR_SCOPE,
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    // DBセッション化により、Googleの最新プロフィール（名前・アイコン等）は
    // ログインのたびにここでUserテーブルへ反映する（アダプタは初回作成時
    // にしか書き込まないため）。
    async signIn({ user, profile }) {
      if (!profile) return;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: typeof profile.name === "string" ? profile.name : undefined,
          email: typeof profile.email === "string" ? profile.email : undefined,
          image: typeof profile.picture === "string" ? profile.picture : undefined,
        },
      });
    },
  },
});
