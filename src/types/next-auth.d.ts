import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    googleAccountId?: string;
    accessToken?: string;
    error?: "RefreshAccessTokenError";
  }
}

declare module "@auth/core/types" {
  interface Session extends DefaultSession {
    googleAccountId?: string;
    accessToken?: string;
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleAccountId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
}
