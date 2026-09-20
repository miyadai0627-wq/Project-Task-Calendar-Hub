import { WifiOff } from "lucide-react";

export const metadata = {
  title: "オフライン | Project Task & Calendar Hub",
};

export default function OfflinePage() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-zinc-50 px-6 text-center text-zinc-700">
      <WifiOff className="h-8 w-8 text-zinc-400" aria-hidden />
      <p className="font-display text-sm font-semibold text-zinc-900">
        オフラインです
      </p>
      <p className="max-w-xs text-xs text-zinc-500">
        ネットワークに接続されていないため、このページを表示できません。接続を確認してもう一度お試しください。
      </p>
    </div>
  );
}
