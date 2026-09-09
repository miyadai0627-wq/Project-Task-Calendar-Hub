"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function GoogleConnectButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-24 shrink-0" aria-hidden />;
  }

  if (session) {
    return (
      <button
        type="button"
        onClick={() => signOut()}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-sky-50"
        title={session.user?.email ?? undefined}
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
        Google連携済み
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-sky-50"
    >
      Googleと連携
    </button>
  );
}
